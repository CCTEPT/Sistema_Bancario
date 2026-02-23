using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountService.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesAndConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_bank_accounts",
                table: "bank_accounts");

            migrationBuilder.RenameIndex(
                name: "IX_bank_accounts_numero_cuenta",
                table: "bank_accounts",
                newName: "i_x_bank_accounts_numero_cuenta");

            migrationBuilder.RenameIndex(
                name: "IX_bank_accounts_id_usuario",
                table: "bank_accounts",
                newName: "i_x_bank_accounts_id_usuario");

            migrationBuilder.AddPrimaryKey(
                name: "p_k_bank_accounts",
                table: "bank_accounts",
                column: "id_cuenta");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "p_k_bank_accounts",
                table: "bank_accounts");

            migrationBuilder.RenameIndex(
                name: "i_x_bank_accounts_numero_cuenta",
                table: "bank_accounts",
                newName: "IX_bank_accounts_numero_cuenta");

            migrationBuilder.RenameIndex(
                name: "i_x_bank_accounts_id_usuario",
                table: "bank_accounts",
                newName: "IX_bank_accounts_id_usuario");

            migrationBuilder.AddPrimaryKey(
                name: "PK_bank_accounts",
                table: "bank_accounts",
                column: "id_cuenta");
        }
    }
}
