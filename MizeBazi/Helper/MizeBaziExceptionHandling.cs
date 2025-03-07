using Microsoft.AspNetCore.Diagnostics;
using MizeBazi.Models;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
namespace MizeBazi.Helper;

public static class MizeBaziExceptionHandling
{
    public static IApplicationBuilder ExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseExceptionHandler(
           options =>
           {
               options.Run(
                   async context =>
                   {
                       var e = context.Features.Get<IExceptionHandlerFeature>();
                       if (e != null)
                       {
                           if (e.Error is MizeBaziException)
                           {

                               //var options = new JsonSerializerOptions
                               //{
                               //    PropertyNamingPolicy = new LowerCaseNamingPolicy(),
                               //    WriteIndented = true // برای خواناتر شدن خروجی
                               //};

                               context.Response.ContentType = context.Request.ContentType != null ? context.Request.ContentType : "application/json";
                               MizeBaziException ex = (MizeBaziException)e.Error;
                               context.Response.StatusCode = 200;
                               string json = JsonSerializer.Serialize(ex.result/*, options*/);
                               
                               await context.Response.WriteAsync(json).ConfigureAwait(false);

                           }
                           else
                           {
                               context.Response.ContentType = "text/html";
                               await context.Response.WriteAsync(e.Error.Message != null ? e.Error.Message : "undefined error").ConfigureAwait(false);
                           }
                       }
                   });
           }
       );
    }

}
public class LowerCaseNamingPolicy : JsonNamingPolicy
{
    public override string ConvertName(string name)
    {
        if (string.IsNullOrEmpty(name) || !char.IsUpper(name[0]))
            return name;

        return name.ToLower();
    }
}
