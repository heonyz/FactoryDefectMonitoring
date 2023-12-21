# -*- coding: utf-8 -*-
import io
import cv2
import Jetson.GPIO as GPIO
import time
from PIL import Image
import os

SWITCH, RAIL = 17, 18 # 4, 18
RAIL_Status = False
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(SWITCH, GPIO.IN)
GPIO.setup(RAIL,GPIO.OUT)
GPIO.output(RAIL,GPIO.LOW)

def gstreamer_pipeline(
    sensor_id=0,
    capture_width=1920,
    capture_height=1080,
    display_width=960,
    display_height=540,
    framerate=30,
    flip_method=0,
):
    return (
        "nvarguscamerasrc sensor-id=%d ! "
        "video/x-raw(memory:NVMM), width=(int)%d, height=(int)%d, framerate=(fraction)%d/1 ! "
        "nvvidconv flip-method=%d ! "
        "video/x-raw, width=(int)%d, height=(int)%d, format=(string)BGRx ! "
        "videoconvert ! "
        "video/x-raw, format=(string)BGR ! appsink"
        % (
            sensor_id,
            capture_width,
            capture_height,
            framerate,
            flip_method,
            display_width,
            display_height,
        )
    )

def capture_camera():
    window_title = "CSI Camera"
    video_capture = cv2.VideoCapture(gstreamer_pipeline(flip_method=0), cv2.CAP_GSTREAMER)
    if video_capture.isOpened():
        try:
            window_handle = cv2.namedWindow(window_title, cv2.WINDOW_AUTOSIZE)
            ret_val, frame = video_capture.read()
            keyCode = cv2.waitKey(10) & 0xFF
            if cv2.getWindowProperty(window_title, cv2.WND_PROP_AUTOSIZE) >= 0:
                cv2.imshow(window_title, frame)
                cv2.imwrite("now.jpg", frame)
        finally:
            video_capture.release()
            cv2.destroyAllWindows()
    else:
        print("Error: Unable to open camera")

if __name__ == "__main__":
    for f in os.listdir("data/"):
        os.remove("data/"+f)
    try:
        os.remove("stop.txt")
    except OSError:
        pass
    delay =0
    interval = 0
    window_title = "CSI Camera"
    # To flip the image, modify the flip_method parameter (0 and 2 are the most common)
    video_capture = cv2.VideoCapture(gstreamer_pipeline(flip_method=0), cv2.CAP_GSTREAMER)
    if video_capture.isOpened():
        try:
            window_handle = cv2.namedWindow(window_title, cv2.WINDOW_AUTOSIZE)
            while True:
                ret_val, frame = video_capture.read()
                keyCode = cv2.waitKey(10) & 0xFF
                # Check to see if the user closed the windows
                # Under GTK+ (Jetson Default), WND_PROP_VISIBLE does not work correctly. Under Qt it does
                # GTK - Substitute WND_PROP_AUTOSIZE to detect if window has been closed by user
                if cv2.getWindowProperty(window_title, cv2.WND_PROP_AUTOSIZE) >= 0:
                    cv2.imshow(window_title, frame)
                    if not os.path.isfile("stop.txt"):
                        if interval > 30:
                            cv2.imwrite("data/"+str(int(time.time()))+".jpg", frame) # 파일 저장
                            #print("save file")
                            interval=0
                        else:
                            interval+=1
                    else:
                        interval=0
                    if GPIO.input(SWITCH) == GPIO.HIGH:
                        if delay == 1:
                            if RAIL_Status:
                                GPIO.output(RAIL,GPIO.LOW)
                            else:
                                GPIO.output(RAIL,GPIO.HIGH)
                            RAIL_Status = not RAIL_Status
                        elif delay < 500:
                            print(delay)
                        else:
                            print("shutdown")
                            os.system("shutdown -h now")
                            break
                        delay+=1
                    else:
                        delay=0
                else:
                    break 
                # Stop the program on the ESC key or "q"
                if keyCode == 27 or keyCode == ord("q"):
                    break
        finally:
            video_capture.release()
            cv2.destroyAllWindows()
    else:
        print("Error: Unable to open camera")
