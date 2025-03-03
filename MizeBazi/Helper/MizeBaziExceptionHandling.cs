using Microsoft.AspNetCore.Diagnostics;
using MizeBazi.Models;
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
                               context.Response.ContentType = context.Request.ContentType != null ? context.Request.ContentType : "application/json";
                               MizeBaziException ex = (MizeBaziException)e.Error;
                               context.Response.StatusCode = 200;
                               var json = System.Text.Json.JsonSerializer.Serialize(ex.result);
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
