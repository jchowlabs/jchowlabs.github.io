---
title: "About Elliptic Curves"
excerpt: ""
collection: primitives
---

### ![Elliptic Curves](/images/elliptic-curve.png){: .align-center}

Introduction
Elliptic Curve Cryptography (ECC) is a modern cryptographic system that provides strong security with relatively small key sizes. It is widely used in secure communications, digital signatures, and encryption protocols. ECC has gained prominence due to its efficiency and security compared to traditional public-key cryptosystems like RSA.

This article explores the history of ECC, the mathematics behind it, and how it is used in cryptographic applications.

A Brief History of ECC
ECC was first proposed in 1985 by Neal Koblitz and Victor S. Miller as an alternative to the then-dominant RSA encryption system. However, it was not widely adopted until the late 1990s, when computing power increased enough to make ECC practical.

The key advantage of ECC over traditional public-key cryptography is that it provides the same level of security with much smaller key sizes. For example:

A 256-bit ECC key provides roughly the same security as a 3072-bit RSA key.
A 384-bit ECC key is equivalent in strength to a 7680-bit RSA key.
This efficiency makes ECC ideal for constrained environments such as mobile devices, smart cards, and blockchain applications.

The Mathematics Behind ECC
At the heart of ECC is the mathematical structure of elliptic curves over finite fields. These curves are defined by equations of the form:

𝑦
2
=
𝑥
3
+
𝑎
𝑥
+
𝑏
y 
2
 =x 
3
 +ax+b
where 
𝑎
a and 
𝑏
b are constants that define the shape of the curve. To be used in cryptography, the curve must satisfy certain properties, ensuring security against attacks.

Elliptic Curve Groups
One of the key aspects of ECC is that it operates over a group of points on an elliptic curve. This group follows these properties:

Point Addition: Given two points 
𝑃
P and 
𝑄
Q on the curve, their sum 
𝑅
=
𝑃
+
𝑄
R=P+Q is defined as the third intersection point of the line passing through 
𝑃
P and 
𝑄
Q. This point is then reflected over the x-axis to get 
𝑅
R.

Point Doubling: If 
𝑃
=
𝑄
P=Q, a tangent line is drawn at 
𝑃
P to determine a new point on the curve.

Scalar Multiplication: The most critical operation in ECC is scalar multiplication, which means computing 
𝑘
𝑃
kP (adding 
𝑃
P to itself 
𝑘
k times). This operation is computationally hard to reverse, forming the basis of ECC's security.

How ECC Works in Cryptography
ECC is used in public-key cryptography, where two parties communicate securely without sharing a secret key beforehand. The Elliptic Curve Diffie-Hellman (ECDH) key exchange and Elliptic Curve Digital Signature Algorithm (ECDSA) are two common applications.

Key Generation in ECC
A user selects a private key 
𝑑
d, a randomly chosen integer.

The corresponding public key is calculated as:

𝑃
=
𝑑
𝐺
P=dG
where 
𝐺
G is a predefined generator point on the curve, and 
𝑑
𝐺
dG represents scalar multiplication.

Elliptic Curve Diffie-Hellman (ECDH) Key Exchange
ECDH allows two parties to establish a shared secret over an insecure channel.

Alice selects a private key 
𝑑
𝐴
d 
A
​
  and computes the public key 
𝑃
𝐴
=
𝑑
𝐴
𝐺
P 
A
​
 =d 
A
​
 G.

Bob selects a private key 
𝑑
𝐵
d 
B
​
  and computes the public key 
𝑃
𝐵
=
𝑑
𝐵
𝐺
P 
B
​
 =d 
B
​
 G.

They exchange public keys and compute the shared secret:

𝑆
=
𝑑
𝐴
𝑃
𝐵
=
𝑑
𝐴
(
𝑑
𝐵
𝐺
)
=
𝑑
𝐵
(
𝑑
𝐴
𝐺
)
=
𝑑
𝐵
𝑃
𝐴
S=d 
A
​
 P 
B
​
 =d 
A
​
 (d 
B
​
 G)=d 
B
​
 (d 
A
​
 G)=d 
B
​
 P 
A
​
 
Since only Alice and Bob know their private keys, only they can compute 
𝑆
S.

Security Advantages of ECC
Smaller Key Sizes: ECC offers strong security with much smaller keys compared to RSA and Diffie-Hellman.
Faster Computation: Operations in ECC are more efficient, making it suitable for resource-constrained devices.
Stronger Security Per Bit: The elliptic curve discrete logarithm problem (ECDLP) is harder to solve than the integer factorization problem used in RSA.
Conclusion
Elliptic Curve Cryptography is one of the most efficient and secure public-key cryptosystems available today. Its small key sizes and strong security make it ideal for modern applications, including digital signatures, blockchain security, and secure communications.