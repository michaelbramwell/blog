+++
date = "2018-08-03T15:24:00+08:00"
title = "Sitecore 8 (9?) Performance configs"
tags = ["sitecore","sitecore-8", "dev", "configuration"]
+++

Speed up your local Sitecore dev instance with the following configs found over on this [gist](https://gist.github.com/kamsar/8c9efc80e72e6ada8304) by Sitecore Platform Architect [Kam Figy](https://kamsar.net/). This works for 8, not sure about 9.

**Performance.Dev.config**
{{< highlight xml >}}
    <!--
	A set of performance optimizations for development that vastly increase application startup time.

	Should not be used in production, as they largely disable forensic diagnostics that you'd want there over fast startup time after a compile.
	-->
	<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
		<sitecore>
			<hooks>
				<hook type="Sitecore.Diagnostics.HealthMonitorHook, Sitecore.Kernel">
					<patch:delete />
				</hook>
				<hook type="Sitecore.Diagnostics.MemoryMonitorHook, Sitecore.Kernel">
					<patch:delete />
				</hook>
			</hooks>
			<pipelines>
				<contentSearch.queryWarmup patch:source="Sitecore.ContentSearch.config">
					<processor type="Sitecore.ContentSearch.Pipelines.QueryWarmups.RunQueries, Sitecore.ContentSearch">
						<patch:delete />
					</processor>
				</contentSearch.queryWarmup>
				<initialize>
					<processor type="Sitecore.Pipelines.Loader.ShowVersion, Sitecore.Kernel">
						<patch:delete />
					</processor>
					<processor type="Sitecore.Pipelines.Loader.ShowHistory, Sitecore.Kernel">
						<patch:delete />
					</processor>
				</initialize>
			</pipelines>
		</sitecore>
	</configuration>
{{< /highlight >}}

**Performance.config**
{{< highlight xml >}}
    <!--
		A set of performance optimizations to improve speed and reduce unnecessary tasks.
		
		Should be used everywhere.
	-->
	<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
		<sitecore>
			<pipelines>
				<initialize>
					<!-- Disable speak precompilations; this increases first hit dialog load time but drastically reduces instance startup time (by about 40 sec) after a compile -->
					<processor type="Sitecore.Pipelines.Initialize.PrecompileSpeakViews, Sitecore.Speak.Client">
						<patch:delete />
					</processor>
					<processor type="Sitecore.Pipelines.Loader.DumpConfigurationFiles, Sitecore.Kernel">
						<patch:delete />
					</processor>
					<!-- Removing precompiler again, now for content testing :-) -->
					<processor type="Sitecore.Pipelines.Initialize.PrecompileSpeakViews, Sitecore.Speak.Client" use="ContentTesting">
						<patch:delete />
					</processor>
				</initialize>
			</pipelines>

			<settings>
				<setting name="Counters.Enabled">
					<!-- disable perf counters for a performance boost -->
					<patch:attribute name="value">false</patch:attribute>
				</setting>
			</settings>

			<scheduling>
				<agent type="Sitecore.Tasks.CounterDumpAgent">
					<patch:delete />
				</agent>
				<!-- get rid of log spam every 10 seconds -->
				<!-- not required for Sitecore 8.1 Update-1 and later -->
				<agent type="Sitecore.ListManagement.Analytics.UnlockContactListsAgent, Sitecore.ListManagement.Analytics">
					<patch:attribute name="interval">00:30:00</patch:attribute>
				</agent>
			</scheduling>
		</sitecore>
	</configuration>

{{< /highlight >}}
