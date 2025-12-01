Set WshShell = CreateObject("WScript.Shell")
' Run the batch file with WindowStyle 0 (Hidden)
' This hides the command prompt completely
WshShell.Run chr(34) & "D:\PROJECT_101\silent-start.bat" & chr(34), 0
Set WshShell = Nothing
