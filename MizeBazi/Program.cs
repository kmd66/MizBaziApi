using MizeBazi.Models;
using MizeBazi.Helper;
using MessagePack;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()  // اجازه دسترسی از هر دامنه‌ای
              .AllowAnyMethod()  // اجازه استفاده از هر متدی (GET, POST, PUT, DELETE و غیره)
              .AllowAnyHeader(); // اجازه استفاده از هر هدری
    });
});

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.SwaggerHederHandling();

builder.Services.AddSignalR()
                .AddMessagePackProtocol(options =>
                {
                    options.SerializerOptions = MessagePackSerializerOptions.Standard
                        .WithResolver(MessagePack.Resolvers.StandardResolver.Instance);
                });

AppStrings.Configuration = builder.Configuration;

builder.Services.InjectionClass();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//app.UseAuthorization();

app.UseCors("AllowAllOrigins");
app.MapControllers();
app.UseStaticFiles();

app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

#region hub link
app.MapHub<MizeBazi.HubControllers.TestHub>("/testHub");
app.MapHub<MizeBazi.HubControllers.RoomHub>("/roomhub");

app.MapHub<MizeBazi.HubControllers.NabardKhandeHub>("/nabardkhandehub");
app.MapHub<MizeBazi.HubControllers.RangRazHub>("/rangrazhub");
app.MapHub<MizeBazi.HubControllers.AfsonVajehHub>("/afsonvajehhub");
app.MapHub<MizeBazi.HubControllers.MafiaHub>("/mafiahub");

app.MapHub<MizeBazi.HubControllers.GroupHub>("/grouphub");
app.MapHub<MizeBazi.HubControllers.FriendHub>("/friendhub");
#endregion

app.ExceptionHandling();

app.Run();


