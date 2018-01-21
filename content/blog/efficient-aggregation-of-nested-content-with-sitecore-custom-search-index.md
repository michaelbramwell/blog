+++
date = "2017-07-09T20:53:02+08:00"
title = "Efficient Aggregation of Nested Content with Sitecore 8 Custom Search Index"
tags = ["dev","sitecore", "search", "index", "lucene", "sitemap", "c-sharp"]
+++

A recent Sitecore 8.2 based application I built was based on a publication journal like nested structure of Years -> Editions -> Volumes -> Sections -> Parts -> Clauses, all up consisting of thousands of individual Sitecore Items. For legal reasons some of this data, in this instance lets say where template property x.PickMe => checked, needed to be aggregated and served as single entity on a page. Obviously serving this data via recursive queries on each request would be very slow, 12 seconds of slow to be precise. While there are a number of options to overcome this including caching I ended up choosing to build a custom Sitecore Search Index. Now all I needed to do was to configure the custom index, create a class that implents Sitecores *IComputedIndexField* interface and finally query the custom index data store and make it available for presenting to the client view.

### Configuration
First we need to make a custom Sitecore Search configuration patch, note the index name we are creating called *custom_search_idx* and the computed index field *Aggregated_Content*. Obviously you need to replace these names with your own. By looking at the below configuration you will noticed that this is configuration for [Lucune](http://lucene.apache.org/core/) search provider, other providers such as [SOLR](http://lucene.apache.org/solr/) requires different [configuration](https://sitecore-community.github.io/docs/search/solr/Configuring-Solr-for-use-with-Sitecore-8/). We also need to specify the crawler's root location from which to index content (e.g the applications home page) which here we name *project_crawler_root_name* with the Sitecore Item Id of the root content node.

{{< highlight xml >}}

<?xml version="1.0" encoding="utf-8" ?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <!--This is where the custom index is actually registered in sitecore-->
    <contentSearch>
      <configuration type="Sitecore.ContentSearch.ContentSearchConfiguration, Sitecore.ContentSearch">
        <indexes hint="list:AddIndex">
          <index id="custom_search_idx" type="Sitecore.ContentSearch.LuceneProvider.LuceneIndex, Sitecore.ContentSearch.LuceneProvider">
            <param desc="name">$(id)</param>
            <param desc="folder">$(id)</param>
            <param desc="propertyStore" ref="contentSearch/indexConfigurations/databasePropertyStore" param1="$(id)" />

            <configuration ref="contentSearch/indexConfigurations/defaultLuceneIndexConfiguration">
             
              <fields hint="raw:AddComputedIndexField">

                <field fieldName="Aggregated_Content" storageType="no" indexType="tokenized"
                       patch:after="field[last()]">ProjectName.Web.Computed_Fields.ComputedPickMesByVolume, ProjectName.Web</field>
              
              <fieldMap type="Sitecore.ContentSearch.FieldMap, Sitecore.ContentSearch">
                <fieldNames hint="raw:AddFieldByFieldName">
                  <field fieldName="_uniqueid" storageType="YES" indexType="TOKENIZED" vectorType="NO" boost="1f" type="System.String"
                         settingType="Sitecore.ContentSearch.LuceneProvider.LuceneSearchFieldConfiguration, Sitecore.ContentSearch.LuceneProvider">
                    <analyzer type="Sitecore.ContentSearch.LuceneProvider.Analyzers.LowerCaseKeywordAnalyzer, Sitecore.ContentSearch.LuceneProvider" />
                  </field>                  
                </fieldNames>
              </fieldMap>
            </configuration>

            <strategies hint="list:AddStrategy">
              <!-- NOTE: order of these is controls the execution order -->
              <strategy ref="contentSearch/indexConfigurations/indexUpdateStrategies/onPublishEndAsync" />
            </strategies>       
            <locations hint="list:AddCrawler">
              <crawler name="project_crawler_root_name" type="Sitecore.ContentSearch.SitecoreItemCrawler, Sitecore.ContentSearch">
                <Database>web</Database>
                <Root>{65B7AC70-BCFC-47CF-8078-E4B48FC34EFA}</Root>
              </crawler>              
            </locations>
          </index>
        </indexes>
      </configuration>
    </contentSearch>
  </sitecore>
</configuration>

{{< /highlight >}}

### Computed Field Class
Here we tell Sitecore what to index by extending *IComputedIndexField* and when we find an Item of template type *Volume*, recursively traversing down the nodes (Sections -> Parts and Clauses), building up a string of content where the Item has field type *PickMe*

{{< highlight csharp >}}

namespace ProjectName.Web.Computed_Fields
{
    public class ComputedPickMesByVolume : IComputedIndexField
    {
        public string FieldName { get; set; }
        public string ReturnType { get; set; }

        public object ComputeFieldValue(IIndexable indexable)
        {
            try
            {
                Item item = indexable as SitecoreIndexableItem;
                if (item != null)
                {
                    var result = ParsePicKMesFromVolume(item);
                    return result == string.Empty ? null : result;
                }

                return null;
            }
            catch (Exception ex)
            {
                Log.Error("Computed Field failed for Item Id: " + indexable.Id, ex, this);
                return null;
            }
        }

        private static string ParsePicKMesFromVolume(Item item)
        {
            StringBuilder sb = new StringBuilder("");

            if (item.TemplateID == new ID(Templates.VolumeTemplateId))
            {
                sb.Append($"<h2>{item['Title']}</h2>");

                if (item.HasChildren)
                {
                    var children = ParseChildren(item.GetChildren());
                    sb.Append(children);
                }
            }

            return sb.ToString();
        }

        private static string ParseChildren(ChildList items)
        {
            StringBuilder sb = new StringBuilder("");

            foreach (Item item in items)
            {
                if (MainUtil.GetBool(item["PickMe"]) && item.TemplateID == new ID(Templates.SectionTemplateId 
                    || item.TemplateID == new ID(Templates.PartTemplateId) 
                    || item.TemplateID == new ID(Templates.ClauseTemplateId)))
                {
                    sb.Append(item["Title"])
                    sb.Append(item["Html"])

                    if(item.HasChildren)
                    {
                        sb.Append(ParseChildren(item.GetChildren())
                    }
                }
            }

            return sb.ToString();
        }
    }
}

{{< /highlight >}}

## Query Indexed Data
The simple query below returns all of our aggregated data from the custom index based on the Volume Id passed into the Execute method. Passing in type AggregatedContentItem into GetQueryable ensures that our index field of aggregate content is included in the result set. In the real world you would map AggregatedContentItem to a DTO but thats not neccessary for this humble example. 

{{< highlight csharp >}}

namespace ProjectName.Web.Models
{
    public class AggregatedContentItem : SearchResultItem
    {
        [IndexField("Aggregated_Content")]
        public string AggregatedContent { get; set; }
    }
}

namespace ProjectName.Web.Services
{
    public class AggregatedContentSearchService
    {

        public SearchResultItem Execute(ID volumeId)
        {
            ISearchIndex index = ContentSearchManager.GetIndex("custom_search_idx")  
            using (IProviderSearchContext context = index.CreateSearchContext())  
            {
                return context.GetQueryable<AggregatedContentItem>()
                    .Where(p => p.ItemId == volumeId);
            }
        }
    }
}

{{< /highlight >}}

## Calling the query 
And finally call the query, let say from a web/mvc controller, which gives us aggregated content in a result set, containing (hopefully) one record for display in milliseconds.

{{< highlight csharp >}}
var _aggregatedContentSearchService = new AggregatedContentSearchService();
var result = _agreggatedContentSearchService.Execute(aVolumeId);

{{< /highlight >}}