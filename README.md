<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-light.svg">
  <img alt="Abhay Singh — operating systems, compilers, bare-metal Rust" src="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-dark.svg" width="100%">
</picture>

I build operating systems and language toolchains. Right now that means a bare-metal Rust kernel that boots to userspace on real x86_64 laptops, and a statically-typed language whose type checker rejects programs that violate quantum mechanics before they ever run.

Most of my time goes to the layer where software meets hardware — schedulers, drivers, paging, and compiler front ends.

## Currently building

- **Networking on bare metal** — brought up the Intel Wireless-AC 9462 `iwlwifi` MLD driver in Nyx over July 2026: firmware load, `ALIVE` handshake, NVM parse, dual-band scan, then drove it end to end until the kernel fetched a real page off the live web.
- **Userspace** — porting a `std` surface for Nyx applications, plus fault hardening in the kernel's memory path.
- **Syscall design** — working out what a POSIX-shaped ABI should borrow from, and where a kernel that knows about quantum execution has to stop borrowing.

---

## Featured work

### Nyx

**A bare-metal operating system that treats quantum execution as a kernel primitive.**

![Rust](https://img.shields.io/badge/Rust-1f2328?style=flat-square&logo=rust&logoColor=DEA584) ![x86_64](https://img.shields.io/badge/x86__64%20asm-1f2328?style=flat-square) ![QEMU](https://img.shields.io/badge/QEMU-1f2328?style=flat-square&logo=qemu&logoColor=FF6600) ![C](https://img.shields.io/badge/C%20interop-1f2328?style=flat-square&logo=c&logoColor=A8B9CC) ![Apache 2.0](https://img.shields.io/badge/Apache--2.0-1f2328?style=flat-square)

Quantum computing is normally a library sitting on top of an OS. Nyx asks what changes if the kernel itself knows about it: quantum programs compile through a QIR pipeline and execute inside the kernel's own execution model, alongside ordinary ELF64 processes.

The part I find most interesting is how little is borrowed. The NVMe block driver, the RTL8168 ethernet driver and its DHCP/TCP/UDP/DNS stack, the Intel `iwlwifi` wireless driver, and an Intel Gen9.5 3D pipeline are written from scratch — the last of those drives a GPU-composited desktop with damage tracking and page-flip presentation. SMP comes up through AP bootstrap with a per-CPU scheduler, and the syscall surface spans 80+ calls across a POSIX-compatible range and a Nyx-native one.

- **Implemented** — SMP, 4-level paging with per-process isolation, ext4 on NVMe, GPU compositor, ACPI thermal/HWP governor, 80+ syscall ABI, wired and wireless networking to the open internet
- **Prototype** — xHCI USB, AHCI/SATA, NVIDIA DRM handshake
- **Status** — Pre-Alpha. Boots to Ring 3 under QEMU, and on select Comet Lake laptops.

Ships with a changelog, contributing guide, code of conduct, and syntax/CLI documentation.

[Repository](https://github.com/Asmodeus14/Nyx) · [Firmware](https://github.com/Asmodeus14/Nyx-Firmwares)

### QCLang

**A language whose type system enforces the no-cloning theorem at compile time.**

![Rust](https://img.shields.io/badge/Rust-1f2328?style=flat-square&logo=rust&logoColor=DEA584) ![OpenQASM](https://img.shields.io/badge/OpenQASM%202.0-1f2328?style=flat-square) ![Apache 2.0](https://img.shields.io/badge/Apache--2.0-1f2328?style=flat-square) ![v0.2.1](https://img.shields.io/badge/release-v0.2.1-1f2328?style=flat-square)

Qubits cannot be copied, and measurement destroys the state you measured. Most quantum SDKs let you write code that ignores both and only complain at runtime. QCLang encodes the constraint in the type system instead: bindings are affine, so a qubit is consumed when used, which turns reassignment and use-after-measurement into compile errors with actionable diagnostics rather than silent physical nonsense.

Rust-inspired syntax with structs, tuples, and type aliases. Classical control flow (`if`, `for`, `while`) interleaves with quantum operations, and the backend emits OpenQASM 2.0. The optimizer integrated into Nyx does dead-qubit elimination and gate cancellation; the standalone QIR phase is still in progress.

- **Implemented** — affine type checking, hybrid control flow, OpenQASM 2.0 output
- **In progress** — standalone QIR optimization phase

[Repository](https://github.com/Asmodeus14/qclang) · [Releases](https://github.com/Asmodeus14/qclang/releases)

### CodeCopilot

**LLM-assisted code review where the hard part was surviving hostile uploads.**

![Python](https://img.shields.io/badge/Python-1f2328?style=flat-square&logo=python&logoColor=FFD43B) ![Flask](https://img.shields.io/badge/Flask-1f2328?style=flat-square&logo=flask&logoColor=FFFFFF) ![React](https://img.shields.io/badge/React%2019-1f2328?style=flat-square&logo=react&logoColor=61DAFB) ![Gemini](https://img.shields.io/badge/Gemini-1f2328?style=flat-square&logo=googlegemini&logoColor=B39DDB)

Static analysers point at a line. This one explains the root cause and proposes a fix, using Gemini over a static analysis pass.

The engineering that actually mattered is in the ingest path, because accepting arbitrary user archives is dangerous. Extraction is bounded on three independent axes — a 20:1 compression ratio ceiling, a 30,000-file count cap, and a recursion depth limit of 20 — so a decompression bomb hits a wall instead of the heap. Requests are rate limited per client, scanning runs as batched work across a bounded worker pool, and the LLM layer degrades to static-only analysis when no API key is present, probing a fallback chain of model names rather than assuming one is available.

[Live demo](https://codecopilot0.vercel.app) · [Backend](https://github.com/Asmodeus14/codecopilot-backend) · [Frontend](https://github.com/Asmodeus14/CodeCopilot-frontend)

### OpenForge

**A collaboration platform where ownership is recorded on-chain rather than in a database column.**

![Solidity](https://img.shields.io/badge/Solidity-1f2328?style=flat-square&logo=solidity&logoColor=FFFFFF) ![TypeScript](https://img.shields.io/badge/TypeScript-1f2328?style=flat-square&logo=typescript&logoColor=3178C6) ![Express](https://img.shields.io/badge/Express-1f2328?style=flat-square&logo=express&logoColor=FFFFFF) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-1f2328?style=flat-square&logo=postgresql&logoColor=4169E1) ![Socket.IO](https://img.shields.io/badge/Socket.IO-1f2328?style=flat-square&logo=socketdotio&logoColor=FFFFFF)

Four repositories rather than one: Solidity contracts holding project ownership, a Node/Express realtime backend speaking Socket.IO over plain SQL against Postgres with JWT and wallet-signature auth, and a React client that renders project space in 3D via react-three-fiber.

Interesting because the trust boundary is unusual — the backend cannot be the source of truth for who owns what, so it verifies `ethers` signatures and treats the chain as authoritative.

[Contracts](https://github.com/Asmodeus14/OpenForge-Contracts) · [Backend](https://github.com/Asmodeus14/OpenForge-Backend) · [Client](https://github.com/Asmodeus14/OpenForge)

---

## Also building

- **[JarNox](https://github.com/Asmodeus14/JarNox-Frontend-)** — stock dashboard; Next.js 15 client against a [FastAPI backend](https://github.com/Asmodeus14/JarNox-Backend-) that scrapes and serves market data
- **[HealthGuard AI](https://github.com/Asmodeus14/HealthGuard-AI-Disease-Prediction-System)** — linear-kernel SVM classifiers over clinical features for diabetes, heart disease, and Parkinson's, served through Streamlit
- **[DSA Journey](https://github.com/Asmodeus14/DSA-Solutions-Journey)** — algorithm solutions in Java

---

## Stack

Only things I have actually shipped code with; each badge maps to a repository above.

**Languages**

![Rust](https://img.shields.io/badge/Rust-1f2328?style=flat-square&logo=rust&logoColor=DEA584) ![C](https://img.shields.io/badge/C-1f2328?style=flat-square&logo=c&logoColor=A8B9CC) ![Python](https://img.shields.io/badge/Python-1f2328?style=flat-square&logo=python&logoColor=FFD43B) ![TypeScript](https://img.shields.io/badge/TypeScript-1f2328?style=flat-square&logo=typescript&logoColor=3178C6) ![JavaScript](https://img.shields.io/badge/JavaScript-1f2328?style=flat-square&logo=javascript&logoColor=F7DF1E) ![Java](https://img.shields.io/badge/Java-1f2328?style=flat-square&logo=openjdk&logoColor=ED8B00) ![Solidity](https://img.shields.io/badge/Solidity-1f2328?style=flat-square&logo=solidity&logoColor=FFFFFF)

**Systems & tooling**

![Linux](https://img.shields.io/badge/Linux-1f2328?style=flat-square&logo=linux&logoColor=FCC624) ![QEMU](https://img.shields.io/badge/QEMU-1f2328?style=flat-square&logo=qemu&logoColor=FF6600) ![Docker](https://img.shields.io/badge/Dev%20Containers-1f2328?style=flat-square&logo=docker&logoColor=2496ED) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-1f2328?style=flat-square&logo=githubactions&logoColor=2088FF) ![no_std](https://img.shields.io/badge/no__std%20%C2%B7%20ACPI%20%C2%B7%20NVMe%2FPCI-1f2328?style=flat-square)

**Backend & data**

![Flask](https://img.shields.io/badge/Flask-1f2328?style=flat-square&logo=flask&logoColor=FFFFFF) ![FastAPI](https://img.shields.io/badge/FastAPI-1f2328?style=flat-square&logo=fastapi&logoColor=009688) ![Node.js](https://img.shields.io/badge/Node.js-1f2328?style=flat-square&logo=nodedotjs&logoColor=5FA04E) ![Express](https://img.shields.io/badge/Express-1f2328?style=flat-square&logo=express&logoColor=FFFFFF) ![Socket.IO](https://img.shields.io/badge/Socket.IO-1f2328?style=flat-square&logo=socketdotio&logoColor=FFFFFF) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-1f2328?style=flat-square&logo=postgresql&logoColor=4169E1)

**Frontend**

![React](https://img.shields.io/badge/React-1f2328?style=flat-square&logo=react&logoColor=61DAFB) ![Next.js](https://img.shields.io/badge/Next.js-1f2328?style=flat-square&logo=nextdotjs&logoColor=FFFFFF) ![Vite](https://img.shields.io/badge/Vite-1f2328?style=flat-square&logo=vite&logoColor=9499FF) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-1f2328?style=flat-square&logo=tailwindcss&logoColor=06B6D4) ![Three.js](https://img.shields.io/badge/three.js-1f2328?style=flat-square&logo=threedotjs&logoColor=FFFFFF)

**ML & scientific**

![scikit-learn](https://img.shields.io/badge/scikit--learn-1f2328?style=flat-square&logo=scikitlearn&logoColor=F7931E) ![pandas](https://img.shields.io/badge/pandas-1f2328?style=flat-square&logo=pandas&logoColor=E70488) ![NumPy](https://img.shields.io/badge/NumPy-1f2328?style=flat-square&logo=numpy&logoColor=4DABCF) ![Streamlit](https://img.shields.io/badge/Streamlit-1f2328?style=flat-square&logo=streamlit&logoColor=FF4B4B) ![Gemini](https://img.shields.io/badge/Gemini%20API-1f2328?style=flat-square&logo=googlegemini&logoColor=B39DDB)

---

## Public code

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/stats-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/stats-light.svg">
  <img alt="Language distribution and activity across public repositories" src="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/stats-dark.svg" width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/output/github-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/output/github-snake.svg">
  <img alt="Contribution graph consumed by a snake" src="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/output/github-snake-dark.svg" width="100%">
</picture>

Both images are generated by GitHub Actions in this repository and served from `raw.githubusercontent.com`, so nothing here depends on a third-party service staying up.

---

## Engineering interests

Kernel and driver development · type systems that make invalid states unrepresentable · compiling for exotic targets · the Rust/C boundary in freestanding environments · what an OS should look like when the hardware underneath it stops being purely classical

## Elsewhere

[Portfolio](https://portfolio-psi-nine-95.vercel.app) · [LinkedIn](https://www.linkedin.com/in/abhay-singh-323b21279/) · [Email](mailto:singhabhay3145@gmail.com)
