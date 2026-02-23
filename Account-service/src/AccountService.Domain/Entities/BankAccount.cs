using System;

namespace AccountService.Domain.Entities
{
    public class BankAccount
    {
        public Guid IdCuenta { get; set; }  // UUID - PK

        public string NumeroCuenta { get; set; } = null!; // Único

        public decimal Saldo { get; set; }

        public string TipoCuenta { get; set; } = null!;

        public string Divisa { get; set; } = null!;

        public Guid IdUsuario { get; set; }

        public string Estado { get; set; } = "Activa"; // Activa / Inactiva

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}