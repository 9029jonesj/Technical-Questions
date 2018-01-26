
## Set-up
Run TestDBSetup.sql to set-up the test database.

## Tasks
-   Write a query to return a list of all members and their corresponding diagnoses and categories (if any):
	-   Please include the following fields: Member ID, First Name, Last Name, Most Severe Diagnosis ID, Most Severe Diagnosis Description, Category ID, Category Description, Category Score and Is Most Severe Category.
	-   Most Severe Diagnosis ID and Description should be the diagnosis with the lowest Diagnosis ID for each Member/Category.
	-   Is Most Severe Category should identify the lowest Category ID for each Member (please set this to 1 for Members without corresponding Categories as well).
	-   This query should return one result for each Member/Category.
-	Write a C# Console Application that prompts for a Member ID and displays the results of the query for that Member.
