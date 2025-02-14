---
title: "Self-Driving Car"
excerpt: ""
collection: projects
---

### ![Self-Driving-Car](/images/self-driving-car.png){: .align-center}

### Building your own self-driving car
Self-driving technology is no longer limited to full-sized vehicles; with the right components and software, you can build a miniature autonomous car at home. In this guide, we will walk through the process of constructing a self-driving toy car using a Raspberry Pi, a generic camera, ultrasonic sensors, and the DeepPiCar library.

### Components Needed

* Raspberry Pi (Model 3B+ or later)
* MicroSD Card (32GB recommended)
* Generic USB Camera
* Ultrasonic Sensors (HC-SR04 recommended)
* Motor Driver (L298N or similar)
* Servo Motor (for steering)
* Chassis (a toy car frame)
* Battery Pack (for portable power)
* DeepPiCar Software

### Setting Up the Raspberry Pi

1. Install Raspberry Pi OS on your microSD card.

2. Enable SSH and Wi-Fi for remote access.

3. Install necessary dependencies using:

* sudo apt update && sudo apt upgrade
* sudo apt install python3-opencv python3-pip

### Installing DeepPiCar

1. Clone the DeepPiCar repository:

* git clone https://github.com/your-repo/deeppicar.git
* cd deeppicar

2. Install required Python packages:

* pip3 install -r requirements.txt

3. Wiring the Components

* Connect motors to the L298N motor driver.
* Attach the servo motor for steering control.
* Wire ultrasonic sensors to the Raspberry Pi’s GPIO pins.
* Attach the camera via USB or CSI interface.

### Configuring the Self-Driving Algorithm

DeepPiCar leverages OpenCV and deep learning to process camera inputs and make driving decisions. Follow these steps:

1. Train the model using sample driving data.

2. Implement obstacle avoidance with ultrasonic sensors.

3. Adjust steering angles based on lane detection.

### Running the Self-Driving Car

1. Start the camera module:

* python3 camera.py

2. Launch the autonomous driving script:

* python3 autopilot.py

3. Place the car on a designated track and observe its navigation.

### Troubleshooting & Optimization

* Improve lane detection by tuning OpenCV parameters.
* Enhance obstacle detection by adjusting sensor threshold values.
* Optimize power management for longer runtimes.

### Conclusion

Building a self-driving toy car is a great way to explore AI, robotics, and IoT. By using DeepPiCar and Raspberry Pi, you can experiment with computer vision and autonomous navigation while enhancing your technical skills.



