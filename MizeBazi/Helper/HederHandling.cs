using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
namespace MizeBazi.Helper;

public static class HederHandling
{
    public static IServiceCollection SwaggerHederHandling(this IServiceCollection services)
    {
        return services.AddSwaggerGen(options =>
        {
            options.OperationFilter<AddDIdHeaderParameter>();
            //options.AddSecurityDefinition("Authorization", new OpenApiSecurityScheme
            //{
            //    Name = "Authorization",
            //    In = ParameterLocation.Header,
            //    Description = "Authorization Heder",
            //    Type = SecuritySchemeType.ApiKey
            //});

            //options.AddSecurityDefinition("test", new OpenApiSecurityScheme
            //{
            //    Name = "test",
            //    In = ParameterLocation.Header,
            //    Description = "test",
            //    Type = SecuritySchemeType.ApiKey
            //});

            //options.OperationFilter<AuthorizationHeaderParameterOperationFilter>();
        });
    }

}

partial class AuthorizationHeaderParameterOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        operation.Security ??= new List<OpenApiSecurityRequirement>();

        var tenantId = new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Authorization" } };
        var userId = new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "test" } };
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            [tenantId] = new List<string>(),
            [userId] = new List<string>()
        });
    }
}
partial class AddDIdHeaderParameter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.Parameters == null)
            operation.Parameters = new List<OpenApiParameter>();

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "D-Id",
            In = ParameterLocation.Header,
            Description = "D Id header",
            Required = false,
            Schema = new OpenApiSchema
            {
                Type = "string",
                Default = new OpenApiString("067a6307cc24ecdf3809125864da24ef")
            }
        });
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "Auth",
            In = ParameterLocation.Header,
            Description = "Auth header",
            Required = false,
            Schema = new OpenApiSchema
            {
                Type = "string",
                Default = new OpenApiString("yNH75b7cgaIbGmeC1odshBrQ/+LK3XzSmJaGbm2GXWT7qcGesazI81HDHFxCGrh81zovEOsA2x4XIzbLypKweLFh7EDPVCuu3E2K2qdrkB0Uac2F5Ovo4lEMgpFDJNhKeEe8UI8mTekrFzjaWDZ1bBqj16zAv7w/SrHd72UPkC3yTOW86kDQm31zExI3R+bqisnh2BsazJr9GC1pYXN8P7/+tzQsV9FHklzMr7bvyv3mmBGDJAo/KqwxR+UP/jP+")
            }
        });
    }
}
// 
