SELECT member.MemberID AS 'Member ID', FirstName AS 'First Name', LastName AS 'Last Name', memberdiagnosis.DiagnosisID AS 'Most Severe Diagnosis ID', diagnosis.DiagnosisDescription AS 'Most Severe Diagnosis Description',
diagnosiscategory.DiagnosisCategoryID AS 'Category ID', diagnosiscategory.CategoryDescription AS 'Category Description', ifnull((SELECT MIN(memberdiagnosis.DiagnosisID) FROM memberdiagnosis WHERE memberdiagnosis.MemberID = member.MemberID), 1) AS 'Is Most Severe Category'
FROM pulse8testdb.member AS member
LEFT JOIN pulse8testdb.memberdiagnosis AS memberdiagnosis 
ON pulse8testdb.member.MemberID = pulse8testdb.memberdiagnosis.MemberID
LEFT JOIN pulse8testdb.diagnosis AS diagnosis
ON diagnosis.DiagnosisID = memberdiagnosis.DiagnosisID
LEFT JOIN pulse8testdb.diagnosiscategorymap AS diagnosiscategorymap
ON diagnosiscategorymap.DiagnosisID = memberdiagnosis.DiagnosisID
LEFT JOIN pulse8testdb.diagnosiscategory AS diagnosiscategory
ON diagnosiscategory.DiagnosisCategoryID = diagnosiscategorymap.DiagnosisCategoryID
ORDER BY member.MemberID, memberdiagnosis.DiagnosisID;