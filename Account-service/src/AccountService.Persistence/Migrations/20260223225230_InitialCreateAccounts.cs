using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountService.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bank_accounts",
                columns: table => new
                {
                    id_cuenta = table.Column<Guid>(type: "uuid", nullable: false),
                    numero_cuenta = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    saldo = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    tipo_cuenta = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    divisa = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Activa"),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bank_accounts", x => x.id_cuenta);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bank_accounts_id_usuario",
                table: "bank_accounts",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "IX_bank_accounts_numero_cuenta",
                table: "bank_accounts",
                column: "numero_cuenta",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bank_accounts");
        }
    }
}
