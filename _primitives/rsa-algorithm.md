---
title: "About the RSA Algorithm"
excerpt: ""
collection: primitives
---

### ![Self-Driving-Car](/images/rsa-algorithm.png){: .align-center}

Introduction
The RSA algorithm is one of the most widely used cryptographic systems for secure communication. Named after its inventors, Ron Rivest, Adi Shamir, and Leonard Adleman, RSA is a public-key encryption system that enables secure data transmission over the internet. It plays a fundamental role in securing online transactions, digital signatures, and various authentication mechanisms.

In this article, we will explore the history of RSA, understand how the algorithm works, and walk through an encryption example with a simple letter.

A Brief History of RSA
The RSA algorithm was introduced in 1977 by three researchers at MIT—Ron Rivest, Adi Shamir, and Leonard Adleman. They were working on the concept of asymmetric cryptography, where two separate keys (public and private) could be used for encryption and decryption.

Before RSA, most cryptographic methods relied on symmetric key encryption, where the same key was used for both encryption and decryption. The problem with symmetric encryption was secure key exchange—if an attacker intercepted the key, they could decrypt the communication.

RSA solved this problem by introducing public-key cryptography (asymmetric encryption), where a user has two keys:

A public key that is shared with others to encrypt messages.
A private key that is kept secret and used to decrypt messages.
The security of RSA is based on the difficulty of factoring large prime numbers, making it computationally infeasible for attackers to derive the private key from the public key.

How the RSA Algorithm Works
The RSA algorithm is based on modular arithmetic and the mathematical difficulty of factoring large numbers. It involves the following steps:

Step 1: Key Generation
Choose two large prime numbers, 
𝑝
p and 
𝑞
q.
Compute their product:
𝑛
=
𝑝
×
𝑞
n=p×q
The value 
𝑛
n is called the modulus and is part of both the public and private keys.
Compute Euler’s totient function 
𝜙
(
𝑛
)
ϕ(n):
𝜙
(
𝑛
)
=
(
𝑝
−
1
)
×
(
𝑞
−
1
)
ϕ(n)=(p−1)×(q−1)
Choose an integer 
𝑒
e (the public exponent) such that:
1
<
𝑒
<
𝜙
(
𝑛
)
1<e<ϕ(n)
𝑒
e is coprime to 
𝜙
(
𝑛
)
ϕ(n), meaning 
gcd
⁡
(
𝑒
,
𝜙
(
𝑛
)
)
=
1
gcd(e,ϕ(n))=1
Common choices for 
𝑒
e are small prime numbers like 65537 for efficiency.
Compute the private exponent 
𝑑
d using the modular multiplicative inverse:
𝑑
=
𝑒
−
1
m
o
d
 
 
𝜙
(
𝑛
)
d=e 
−1
 modϕ(n)
This means 
𝑑
d is the number that satisfies:
𝑒
×
𝑑
≡
1
m
o
d
 
 
𝜙
(
𝑛
)
e×d≡1modϕ(n)
Now, the public key is 
(
𝑛
,
𝑒
)
(n,e), and the private key is 
(
𝑛
,
𝑑
)
(n,d).

Step 2: Encryption
To encrypt a plaintext message 
𝑀
M:

Convert the message into a numerical format. Each letter can be represented by a number (e.g., A = 0, B = 1, etc.).
Compute the ciphertext 
𝐶
C using the public key:
𝐶
=
𝑀
𝑒
m
o
d
 
 
𝑛
C=M 
e
 modn
Step 3: Decryption
To decrypt the ciphertext 
𝐶
C:

Compute the original message 
𝑀
M using the private key:
𝑀
=
𝐶
𝑑
m
o
d
 
 
𝑛
M=C 
d
 modn
This step retrieves the original message.

Example: Encrypting a Letter Using RSA
Let’s encrypt the letter "B" (assuming A = 0, B = 1, C = 2, etc.) using RSA with small prime numbers.

Step 1: Key Generation
Choose prime numbers: 
𝑝
=
3
p=3, 
𝑞
=
11
q=11

Compute 
𝑛
n:

𝑛
=
3
×
11
=
33
n=3×11=33
Compute 
𝜙
(
𝑛
)
ϕ(n):

𝜙
(
𝑛
)
=
(
3
−
1
)
×
(
11
−
1
)
=
2
×
10
=
20
ϕ(n)=(3−1)×(11−1)=2×10=20
Choose 
𝑒
e, which must be coprime with 20. Let’s choose e = 7.

Compute 
𝑑
d, the modular inverse of 
𝑒
e mod 
𝜙
(
𝑛
)
ϕ(n):

𝑑
=
7
−
1
m
o
d
 
 
20
d=7 
−1
 mod20
Using the extended Euclidean algorithm, we find:

𝑑
=
3
d=3
So, the public key is (33, 7), and the private key is (33, 3).

Step 2: Encryption
Let’s encrypt the letter "B", which corresponds to M = 1.

Using the encryption formula:

𝐶
=
𝑀
𝑒
m
o
d
 
 
𝑛
C=M 
e
 modn
𝐶
=
1
7
m
o
d
 
 
33
C=1 
7
 mod33
𝐶
=
1
C=1
So, the encrypted value of "B" is 1.

Step 3: Decryption
To decrypt, use:

𝑀
=
𝐶
𝑑
m
o
d
 
 
𝑛
M=C 
d
 modn
𝑀
=
1
3
m
o
d
 
 
33
M=1 
3
 mod33
𝑀
=
1
M=1
So, the decrypted value is 1, which corresponds to "B", confirming the correct decryption.

Security of RSA
The security of RSA relies on the difficulty of factoring large numbers. For example, if 
𝑛
n is a product of two 1024-bit primes, factoring it using the best-known algorithms would take billions of years with current computational power.

However, RSA is vulnerable to certain attacks if:

Small values of 
𝑒
e are used incorrectly.
Poor randomness is used for prime selection.
Quantum computers become powerful enough (Shor’s algorithm can break RSA efficiently).
For security, modern RSA implementations use 2048-bit or 4096-bit keys.

Conclusion
RSA remains one of the most important cryptographic algorithms, ensuring secure communications across the internet. By using asymmetric encryption, RSA provides a method for secure data exchange, authentication, and digital signatures.

This article covered:

The history and importance of RSA.
How the RSA algorithm works.
A step-by-step encryption example.
RSA’s security is rooted in number theory, and as long as large key sizes are used, it remains a trusted encryption method. However, future advancements in quantum computing may require transitioning to post-quantum cryptography.

