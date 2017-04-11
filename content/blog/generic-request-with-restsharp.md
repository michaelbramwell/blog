+++
tags = ["dev","c-sharp"]
date = "2016-05-06T20:42:42+08:00"
title = "Generic request with Rest Sharp"

+++

[RestSharp](https://github.com/restsharp/RestSharp) is a simple 'REST and HTTP API Client for .NET'. The MakeRequest function highlighted below takes a relative endpoint, makes a request and deserializes to the model type that is passed into the RestClient Execute function. 

{{< highlight csharp >}}
public static IRestResponse<T> MakeRequest(string relativeUrl, Func<RestClient, RestRequest, IRestResponse<T>> clientFunc)
{
    var client = new RestClient("https://someresource.com");
    var request = new RestSharp.RestRequest(relativeUrl);
    return clientFunc(client, request);
}

// example call
var request = MakeRequest("/api/whatever", (c, r) => c.Execute<SomeType>(r));
var deserializedSomeTypeData = request.Data;
{{< /highlight >}}

