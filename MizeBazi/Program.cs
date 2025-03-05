using MizeBazi.Models;
using MizeBazi.Helper;

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

app.ExceptionHandling();

app.Run();


