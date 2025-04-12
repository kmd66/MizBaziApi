using MizeBazi.Models;
using System;
using System.Text.Json;

namespace MizeBazi.Helper;

public class AppRequest
{
    public async Task<Result> Post(object body, string url)
    {
        var result = await post(body, url);  
        if(!result.success)
            return result;

        return result.data.JsonToObject<Result>();
    }
    public async Task<Result<T>> Post<T>(object body, string url, bool resultModel= true)
    {
        var result = await post(body, url);
        if (!result.success)
            return Result<T>.Failure(message:result.message);

        try
        {
            if(resultModel)
                return result.data.JsonToObject<Result<T>>();
            var model = result.data.JsonToObject<T>();
            return Result<T>.Successful(data:model);
        }
        catch (Exception e)
        {
            return Result<T>.Failure(message: e.Message);
        }
    }
    async Task<Result<string>> post(object body, string url)
    {
        using (HttpClient client = new HttpClient())
        {
            if (body == null)
                body = new { };
            var jsonData = body.ToJson();
            try
            {

                HttpContent content = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return Result<string>.Successful(data: responseBody);
                }
                else
                {
                }
            }
            catch (Exception e)
            {
                return Result<string>.Failure(message: e.Message);
            }
        }

        return Result<string>.Failure(message: "client null");

    }
}