using Logica;
using Logica.Conexion;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Aprende más sobre cómo configurar Swagger/OpenAPI en https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Agrega la clase de conexión como un servicio singleton
builder.Services.AddSingleton<ConexionDB>();
builder.Services.AddScoped<Auditoria>();
builder.Services.AddScoped<Respaldos>(); // O AddSingleton si prefieres
builder.Services.AddScoped<Seguridad>();
builder.Services.AddScoped<Tablespaces>();
builder.Services.AddScoped<Performance>();
builder.Services.AddScoped<Tuning>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()   // Permitir cualquier origen
                   .AllowAnyMethod()   // Permitir cualquier método HTTP (GET, POST, etc.)
                   .AllowAnyHeader();  // Permitir cualquier encabezado
        });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var conexionDB = scope.ServiceProvider.GetRequiredService<ConexionDB>();
    conexionDB.ProbarConexion();
}




// Configura el pipeline de solicitudes HTTP.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
