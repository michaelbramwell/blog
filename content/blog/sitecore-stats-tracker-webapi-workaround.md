+++
date = "2017-09-30T20:53:02+08:00"
title = "Sitecore 8 Stats Tracker WebAPI Workaround"
tags = ["dev","sitecore", "Sitecore 8", "statistics", "tracker", "workaround", "c-sharp", "WebAPI"]
+++

When building asynchronous applications with Sitecore 8 there is often the need to track the current requested page with [Sitecore Analytics Tracker](https://doc.sitecore.net/sitecore_experience_platform/81/developing/marketing_operations/analytics_tracking) as one would normally do with a traditional synchronously loaded requested. The problem is however that *Tracker.Current* requires the current session state which while available in WebForms or MVC controls is not available in ASP.NET Web API. As you may have encounted the value of *Tracker.Current* in WebAPI requests is null. 

I've seen solutions to this problem which involve configuring the Web API to load the session state. While this works it comes with some big caveats around performance and intent; particular in regard to RESTful services which should be to a [large degree stateless](https://stackoverflow.com/a/30498231). We can however simply fire off a second async request, for instance in the then() method of JavaScript's Fetch API, to a Controller Rendering which we know contains session state and therefore has a hydrated *Tracker.Current* state.

### Create Controller Rendering
The first step is to create a controller rendering, we will call ours *TrackItemRequest*. 

For more information on how to create Sitecore Controller renderings and adding to a Sitecore Item please read the [following article](http://www.jondjones.com/learn-sitecore-cms/sitecore-developers-guide/sitecore-and-mvc/how-to-make-sitecore-use-a-mvc-controller-controller-renderings-explained).

### Create Controller
Now create the controller and Action method ensuring that it matches the naming entered in the Controller Rendering configuration i.e make sure it maps to *TrackItemRequest*

{{< highlight csharp >}}

public void Get(string itemId = "")
{
    if(string.IsNullOrEmpty(itemId))
    {
        return;
    }

    try
    {
        var master = Sitecore.Configuration.Factory.GetDatabase("master");
        var result = Sitecore.Data.Database.GetTemplate(new ID(itemId));

        if (result != null)
        {
            // track the item
            var interaction = Tracker.Current.Session.Interaction;
            // Sitecore Page Visited Event Id
            var pageEventData = new PageEventData("Page visited", new Guid("{7DAF6F40-87EA-4594-B977-4994E5B439D3}"))
            {
                ItemId = result.Id,
                Data = result.Title,
                Text = $"Async call to page {result.Title} with url {result.Url} and Id {result.Id}"
            };

            interaction.CurrentPage.Register(pageEventData);
        }
    }
    catch (Exception e)
    {
        // logging goes here
    }
}

{{< /highlight >}}

### Create Sitecore Item
Next create a Sitecore item and add the above control to it, lets call ours *tracker*. Now we have a page/item we can call asynchronously from JavaScript whenever we want to raise a tracking event. As we will never be exposing the view of this page as a UI to the end user, you will want to ensure that you a using a 'bare bones' layout to reduce the amount of HTML your tracker request is responding with.

### Invoking
The *TrackItemRequest* action method can be invoked in any number of ways and would usually be fired off once an item had been successfully loaded, for example in a JavaScript fetch's then() method.

{{< highlight javascript >}}

fetch('/api/loadSomeContent', {
	method: 'get'
}).then(function(response) {
	// hit the sitecore page/item that contains the tracker controller
    // in the real world this would be a call to re-usable function
    // in this example the successfull response returns the item id
    fetch(`/yourPathToYourTrackerItem/tracker?itemId=${response.itemId}`, {
	    method: 'get'
    })
})

{{< /highlight >}}

Now every async request will be picked up by Sitecore's analytics tracking engine without adding the additional overhead of the session state to the WebAPI.


