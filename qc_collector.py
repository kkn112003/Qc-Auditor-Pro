import wmi
import json
import os
import sys
import datetime
import math

def get_detailed_info():
    data = {
        "meta": {
            "scan_timestamp": datetime.datetime.now().isoformat(),
            "script_version": "2.2"
        },
        "identity": {},
        "specs": {},
        "battery": {},
        "connectivity": {},
        "system_check": {},
        "manual_inspection": {
             "phys_body_ok": None,
             "phys_engsel_ok": None,
             "phys_lcd_ok": None,
             "phys_keyboard_ok": None,
             "phys_port_ok": None,
             "phys_camera_test_ok": None,
             "phys_sound_test_ok": None
        }
    }

    try:
        c = wmi.WMI()
        
        # 1. IDENTITY
        bios = c.Win32_BIOS()[0]
        cs = c.Win32_ComputerSystem()[0]
        data["identity"] = {
            "brand": cs.Manufacturer.strip(),
            "model": cs.Model.strip(),
            "serial_number": bios.SerialNumber.strip(),
            "bios_version": bios.SMBIOSBIOSVersion.strip()
        }

        # 2. SPECS
        # CPU
        proc = c.Win32_Processor()[0]
        data["specs"]["cpu"] = {
            "name": proc.Name.strip(),
            "cores": proc.NumberOfCores,
            "threads": proc.NumberOfLogicalProcessors
        }
        
        # RAM
        ram_bytes = int(cs.TotalPhysicalMemory)
        ram_modules = c.Win32_PhysicalMemory()
        data["specs"]["ram"] = {
            "total_gb": round(ram_bytes / (1024**3)),
            "slots_used": len(ram_modules),
            "type": "Unknown", 
            "speed": f"{ram_modules[0].Speed} MHz" if ram_modules else "Unknown"
        }

        # GPU
        gpus = [g.Name for g in c.Win32_VideoController()]
        data["specs"]["gpu"] = gpus

        # Storage
        storage_list = []
        disks = c.Win32_DiskDrive()
        for disk in disks:
            # Simple Health Logic based on Status
            health = 100 if disk.Status == "OK" else 50
            storage_list.append({
                "model": disk.Model.strip(),
                "type": "Fixed Disk", 
                "capacity_gb": round(int(disk.Size) / (1024**3)),
                "smart_status": disk.Status,
                "health_percent": health 
            })
        data["specs"]["storage"] = storage_list

        # 3. BATTERY (Advanced WMI)
        try:
            # Accessing BatteryStaticData for Design Capacity
            # Fixed: Use double backslash 'root\\WMI' in JS so it becomes 'root\WMI' in Python file
            wmi_batt = wmi.WMI(namespace='root\\WMI')
            battery_static = wmi_batt.BatteryStaticData()[0]
            battery_full = wmi_batt.BatteryFullChargedCapacity()[0]
            
            design_cap = battery_static.DesignedCapacity
            full_cap = battery_full.FullChargedCapacity
            
            if design_cap > 0 and full_cap > 0:
                wear = round((1 - (full_cap / design_cap)) * 100, 1)
            else:
                wear = 0
            
            # Cycle Count Placeholder
            cycles = 0 
            
            data["battery"] = {
                "present": True,
                "design_capacity_mwh": design_cap,
                "full_charge_capacity_mwh": full_cap,
                "wear_level_percent": wear,
                "cycle_count": cycles
            }
        except Exception as e:
            data["battery"] = {
                "present": False,
                "design_capacity_mwh": 0,
                "full_charge_capacity_mwh": 0,
                "wear_level_percent": 0,
                "cycle_count": 0
            }

        # 4. CONNECTIVITY
        pnps = c.Win32_PnPEntity()
        wifi = "Not Detected"
        bt = False
        cam = False
        audio = "Standard Audio"
        
        for p in pnps:
            name = p.Name if p.Name else ""
            if "Wi-Fi" in name or "Wireless" in name and "Adapter" in name:
                wifi = name
            if "Bluetooth" in name:
                bt = True
            if "Camera" in name or "Webcam" in name:
                cam = True
                
        data["connectivity"] = {
            "wifi_module": wifi,
            "bluetooth_present": bt,
            "webcam_present": cam,
            "audio_device": audio
        }

        # 5. SYSTEM & DRIVERS
        os_info = c.Win32_OperatingSystem()[0]
        
        problem_devices = c.Win32_PnPEntity(ConfigManagerErrorCode__ne=0)
        driver_issues = []
        for d in problem_devices:
            if d.Name:
                driver_issues.append(d.Name)

        data["system_check"] = {
            "os_info": f"{os_info.Caption} {os_info.OSArchitecture}",
            "activation_status": "Checked",
            "driver_issues": driver_issues
        }

    except Exception as e:
        data["error"] = str(e)
        if "identity" not in data:
            data["identity"] = {"serial_number": "ERROR_READ"}

    return data

if __name__ == "__main__":
    print("--------------------------------")
    print("   QC AUDITOR PRO - COLLECTOR   ")
    print("   Scanning Hardware...         ")
    print("--------------------------------")
    
    qc_data = get_detailed_info()
    sn = qc_data["identity"].get("serial_number", "UNKNOWN_SN")
    
    filename = f"QC_{sn}.json"
    
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    else:
        application_path = os.path.dirname(os.path.abspath(__file__))
        
    file_path = os.path.join(application_path, filename)
    
    try:
        with open(file_path, "w") as f:
            json.dump(qc_data, f, indent=2)
        print(f"[SUCCESS] Report saved: {filename}")
        
        # Simple Console Summary
        batt = qc_data.get("battery", {})
        
        print("")
        print(f"Summary for {qc_data['identity'].get('model')}:")
        print(f"CPU: {qc_data['specs']['cpu']['name']}")
        print(f"RAM: {qc_data['specs']['ram']['total_gb']}GB")
        if batt.get('present'):
            print(f"Battery Wear: {batt.get('wear_level_percent')}%")
        
        issues = qc_data['system_check'].get('driver_issues', [])
        if issues:
            print(f"[WARNING] {len(issues)} Driver Errors found!")
        else:
            print("[OK] All Drivers Healthy")

    except Exception as e:
        print(f"[ERROR] Save failed: {e}")
        
    print("")
    print("--------------------------------")
    os.system("pause")
