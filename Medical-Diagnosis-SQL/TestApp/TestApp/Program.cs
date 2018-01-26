using System;
// Add MySql Library
using MySql.Data.MySqlClient;

namespace Pulse8App
{
    class Program
    {
        static void Main(string[] args)
        {
            MySqlConnection connection;
            MySqlConnectionStringBuilder connectionString = new MySqlConnectionStringBuilder();
            connectionString.Server = "127.0.0.1";
            connectionString.UserID = "root";
            connectionString.Password = "password";
            connectionString.Database = "pulse8testdb";
            string memberID = "";

            connection = new MySqlConnection(connectionString.ToString());

            Console.Write("Insert Member ID:");

            ConsoleKeyInfo key;

            do
            {
                key = Console.ReadKey(true);
                if (key.Key != ConsoleKey.Backspace)
                {
                    double val = 0;
                    bool _x = double.TryParse(key.KeyChar.ToString(), out val);
                    if (_x)
                    {
                        memberID += key.KeyChar;
                        Console.Write(key.KeyChar);
                    }
                }
                else
                {
                    if (key.Key == ConsoleKey.Backspace && memberID.Length > 0)
                    {
                        memberID = memberID.Substring(0, (memberID.Length - 1));
                        Console.Write("\b \b");
                    }
                }
            }

            // Stops Receving Keys Once Enter is Pressed
            while (key.Key != ConsoleKey.Enter);

            string query = "SELECT member.MemberID AS" + "'Member ID'" + ", FirstName AS " + "'First Name'" + ", LastName AS " + "'Last Name'" + ", ifnull(memberdiagnosis.DiagnosisID, 1) AS" + "'Most Severe Diagnosis ID'" + ", ifnull(diagnosis.DiagnosisDescription, 'Test Diagnosis 1') AS" + "'Most Severe Diagnosis Description'" +
                            ", ifnull(diagnosiscategory.DiagnosisCategoryID, 1) AS" + "'Category ID'" + ", ifnull(diagnosiscategory.CategoryDescription, 'Category A') AS" + "'Category Description'" + ", ifnull((SELECT MIN(memberdiagnosis.DiagnosisID) FROM memberdiagnosis WHERE memberdiagnosis.MemberID = member.MemberID), 1) AS" + "'Is Most Severe Category'" +
                            " FROM member LEFT JOIN memberdiagnosis ON member.MemberID = memberdiagnosis.MemberID LEFT JOIN diagnosis ON diagnosis.DiagnosisID = memberdiagnosis.DiagnosisID LEFT JOIN diagnosiscategorymap ON diagnosiscategorymap.DiagnosisID = memberdiagnosis.DiagnosisID" +
                            " LEFT JOIN diagnosiscategory ON diagnosiscategory.DiagnosisCategoryID = diagnosiscategorymap.DiagnosisCategoryID WHERE member.MemberID = " + memberID +
                            " ORDER BY member.MemberID, memberdiagnosis.DiagnosisID";
            Console.WriteLine();
            try
            {
                connection.Open();
                //Create Command
                MySqlCommand cmd = new MySqlCommand(query, connection);
                //Create a data reader and Execute the command
                MySqlDataReader dataReader = cmd.ExecuteReader();

                //Read the data and store them in the list
                while (dataReader.Read())
                {
                    Console.WriteLine();
                    Console.WriteLine("Member ID: " + dataReader.GetString(0));
                    Console.WriteLine("First Name: " + dataReader.GetString(1));
                    Console.WriteLine("Last Name: " + dataReader.GetString(2));
                    Console.WriteLine("Most Severe Diagnosis ID: " + dataReader.GetString(3));
                    Console.WriteLine("Most Severe Diagnosis Description: " + dataReader.GetString(4));
                    Console.WriteLine("Category ID: " + dataReader.GetString(5));
                    Console.WriteLine("Category Description: " + dataReader.GetString(6));
                    Console.WriteLine("Is Most Severe Category: " + dataReader.GetString(7));
                }

                //close Data Reader
                dataReader.Close();

                try
                {
                    connection.Close();
                }
                catch (MySqlException ex)
                {
                    Console.WriteLine("Error: " + ex.Message);
                }
            }
            catch (MySqlException ex)
            {
                // When handling errors, you can your application's response based on the error number.
                // The two most common error numbers when connecting are as follows:
                // 0: Cannot connect to server.
                // 1045: Invalid user name and/or password.
                switch (ex.Number)
                {
                    case 0:
                        Console.WriteLine("Cannot connect to server.  Contact administrator");
                        break;

                    case 1045:
                        Console.WriteLine("Invalid username/password, please try again");
                        break;
                }
            }
            Console.WriteLine();
            Console.WriteLine("Press any key to close...");
            Console.ReadKey();
        }

    }
}
