# ADB (Android Debug Bridge) Guide

```bash
adb devices
```

Once it shows your device (with device status, not unauthorized), switch to wireless with:

```bash
adb tcpip 5555
adb connect <PHONE_IP>:5555
```
