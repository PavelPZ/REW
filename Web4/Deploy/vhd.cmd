rem http://blogs.msdn.com/b/7/archive/2009/10/08/diskpart-exe-and-managing-virtual-hard-disks-vhds-in-windows-7.aspx
rem https://technet.microsoft.com/cs-cz/library/gg252579(v=ws.10).aspx
rem diskpart /s "D:\temp\vhd.cmd"
create vdisk file="d:\temp\test2.vhd" maximum=1000 type=expandable
select vdisk file="d:\temp\test2.vhd"
attach vdisk 
create partition primary 
format fs=ntfs label="Test VHD" quick 
assign letter=v 
exit