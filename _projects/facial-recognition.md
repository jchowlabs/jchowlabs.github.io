---
title: "Facial Recognition System"
excerpt: ""
collection: projects
---

### ![Self-Driving-Car](/images/self-driving-car.png){: .align-center}

### Building your own facial recognition system

Facial recognition is an exciting and widely used technology in security, automation, and personal projects. In this guide, we will walk through building a facial recognition system using a Raspberry Pi, a Pi Camera, and the OpenCV facial recognition library.

### Prerequisites

* Before we begin, ensure you have the following:
* Raspberry Pi (preferably Raspberry Pi 4 for better performance)
* Raspberry Pi Camera Module
* MicroSD Card with Raspberry Pi OS installed
* Power supply for Raspberry Pi
* Internet connectivity (optional for downloading dependencies)
* USB keyboard and mouse (for initial setup)

#### Step 1: Install OpenCV and Dependencies

To get started, update your Raspberry Pi and install the necessary dependencies:

```python
sudo apt update && sudo apt upgrade -y
sudo apt install python3-opencv libopencv-dev python3-pip -y
pip3 install numpy face-recognition
```

This installs OpenCV, the face-recognition library, and the required dependencies.

#### Step 2: Setting Up the Pi Camera

Enable the Pi Camera using the Raspberry Pi configuration tool:

```python
sudo raspi-config
```

Navigate to Interfacing Options > Camera > Enable. Reboot the Raspberry Pi to apply changes:

```python 
sudo reboot
```

Test the camera by running:

```python
raspistill -o test.jpg
```

If the command captures an image, the camera is working correctly.

### Step 3: Capture and Train Facial Data

Create a Python script to capture images and store them for training:

```python
import cv2
import os

# Create a directory to store images
face_dir = "faces"
os.makedirs(face_dir, exist_ok=True)

# Initialize camera
cap = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

count = 0
while count < 10:  # Capture 10 images for training
    ret, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        cv2.imwrite(f"{face_dir}/face_{count}.jpg", face)
        count += 1
        
    cv2.imshow("Capturing Face", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

This script captures images of faces and saves them for recognition.

### Step 4: Train and Recognize Faces

Now, use the face-recognition library to identify faces:

```python
import face_recognition
import cv2
import numpy as np
import os

known_faces = []
known_names = []
face_dir = "faces"

# Load images and encode faces
for file in os.listdir(face_dir):
    image = face_recognition.load_image_file(os.path.join(face_dir, file))
    encoding = face_recognition.face_encodings(image)[0]
    known_faces.append(encoding)
    known_names.append(file.split("_")[1])

# Initialize camera
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    rgb_frame = frame[:, :, ::-1]
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    
    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        matches = face_recognition.compare_faces(known_faces, face_encoding)
        name = "Unknown"
        
        if True in matches:
            first_match_index = matches.index(True)
            name = known_names[first_match_index]
        
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    cv2.imshow("Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

This script recognizes and labels faces in real time.

### Step 5: Testing and Deployment

Run the script and test if it recognizes faces. You can optimize it further by:

* Increasing the number of training images
* Implementing a database for face storage
* Integrating it with home automation systems

### Conclusion

Congratulations! You have built a simple facial recognition system using a Raspberry Pi, Pi Camera, and OpenCV. With further improvements, this can be used in security systems, smart home applications, and personal projects.
