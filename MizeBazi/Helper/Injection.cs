using System.Reflection;

namespace MizeBazi.Helper;

public static class Injection
{
    public static IServiceCollection InjectionClass(this IServiceCollection services)
    {
        //var descriptors = services.ToList();
        //foreach (var descriptor in descriptors)
        //{
        //    services.Remove(descriptor);
        //}

        services.AddHttpContextAccessor();

        services.AddScoped<IRequestInfo, RequestInfo>();
        return services.Scan(scan =>
            scan.FromApplicationDependencies(a => StartsWith(a, "MizeBazi"))
            .AddClasses(classes => classes.InNamespaceOf<MizeBazi.Service.IService>()
                .AssignableTo<MizeBazi.Service.IService>())
        .AsSelf()
        //.AsMatchingInterface()
        .WithScopedLifetime());



    }
    public static bool StartsWith(Assembly a, string prefix)
    {
        return a.GetName().Name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
    }

}