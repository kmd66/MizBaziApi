using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Helper;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeAttribute : Attribute, IAuthorizationFilter
{
    public async void OnAuthorization(AuthorizationFilterContext context)
    {
        if (checkAuthorize(context.ActionDescriptor as ControllerActionDescriptor))
        {
            string authHeader = context.HttpContext.Request.Headers["Auth"];
            var model = new JwtHelper().Decode(authHeader);
            if (model == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }
            string Did = context.HttpContext.Request.Headers["D-Id"];
            if (Did != model.DeviceId)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

        }
    }

    private bool checkAuthorize(ControllerActionDescriptor controllerActionDescriptor)
    {
        if (controllerActionDescriptor != null)
        {
            var ControllerChecking = controllerActionDescriptor.ControllerTypeInfo.CustomAttributes.Where(w => w.AttributeType.Name.Contains("AllowAnonymous")).ToList();
            if (ControllerChecking.Count > 0)
                return false;
            var ActionChecking = controllerActionDescriptor.MethodInfo.CustomAttributes.Where(w => w.AttributeType.Name.Contains("AllowAnonymous")).ToList();
            if (ActionChecking.Count > 0)
                return false;
        }

        return true;
    }

}