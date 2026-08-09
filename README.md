<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-light.svg">
  <img alt="Abhay Singh — operating systems, compilers, bare-metal Rust" src="https://raw.githubusercontent.com/Asmodeus14/Asmodeus14/Dump/assets/banner-dark.svg" width="100%">
</picture>

I build operating systems and language toolchains. Right now that means a bare-metal Rust kernel that boots to userspace on real x86_64 laptops, and a statically-typed language whose type checker rejects programs that violate quantum mechanics before they ever run.

Most of my time goes to the layer where software meets hardware — schedulers, drivers, paging, and compiler front ends.

---

## Featured work

### Nyx

**A bare-metal operating system that treats quantum execution as a kernel primitive.**

Quantum computing is normally a library sitting on top of an OS. Nyx asks what changes if the kernel itself knows about it: quantum programs compile through a QIR pipeline and execute inside the kernel's own execution model, alongside ordinary ELF64 processes.

The part I find most interesting is how little is borrowed. The NVMe block driver, the RTL8168 ethernet driver and its DHCP/TCP/UDP/DNS stack, and an Intel Gen9.5 3D pipeline are written from scratch — the last of those drives a GPU-composited desktop with damage tracking and page-flip presentation. SMP comes up through AP bootstrap with a per-CPU scheduler, and the syscall surface spans 80+ calls across a POSIX-compatible range and a Nyx-native one.

- **Implemented** — SMP, 4-level paging with per-process isolation, ext4 on NVMe, GPU compositor, ACPI thermal/HWP governor, 80+ syscall ABI
- **Prototype** — xHCI USB, Intel WiFi, AHCI/SATA, NVIDIA DRM handshake
- **Status** — Pre-Alpha. Boots to Ring 3 under QEMU, and on select Comet Lake laptops.

Rust (kernel) · x86_64 assembly · C interop via ACPICA and lwext4 · Apache-2.0

[Repository](https://github.com/Asmodeus14/Nyx) · [Firmware](https://github.com/Asmodeus14/Nyx-Firmwares)

### QCLang

**A language whose type system enforces the no-cloning theorem at compile time.**

Qubits cannot be copied, and measurement destroys the state you measured. Most quantum SDKs let you write code that ignores both and only complain at runtime. QCLang encodes the constraint in the type system instead: bindings are affine, so a qubit is consumed when used, which turns reassignment and use-after-measurement into compile errors with actionable diagnostics rather than silent physical nonsense.

Rust-inspired syntax with structs, tuples, and type aliases. Classical control flow (`if`, `for`, `while`) interleaves with quantum operations, and the backend emits OpenQASM 2.0. The optimizer integrated into Nyx does dead-qubit elimination and gate cancellation; the standalone QIR phase is still in progress.

- **Implemented** — affine type checking, hybrid control flow, OpenQASM 2.0 output
- **In progress** — standalone QIR optimization phase

Rust · OpenQASM 2.0 · Apache-2.0 · [v0.2.1](https://github.com/Asmodeus14/qclang/releases)

[Repository](https://github.com/Asmodeus14/qclang)

### CodeCopilot

**LLM-assisted code review where the hard part was surviving hostile uploads.**

Static analysers point at a line. This one explains the root cause and proposes a fix, using Gemini over a static analysis pass.

The engineering that actually mattered is in the ingest path, because accepting arbitrary user archives is dangerous. Extraction is bounded on three independent axes — a 20:1 compression ratio ceiling, a 30,000-file count cap, and a recursion depth limit of 20 — so a decompression bomb hits a wall instead of the heap. Requests are rate limited per client, scanning runs as batched work across a bounded worker pool, and the LLM layer degrades to static-only analysis when no API key is present, probing a fallback chain of model names rather than assuming one is available.

Python · Flask · React · Gemini · rate limiting via Flask-Limiter

[Live demo](https://codecopilot0.vercel.app) · [Backend](https://github.com/Asmodeus14/codecopilot-backend) · [Frontend](https://github.com/Asmodeus14/CodeCopilot-frontend)

---

## Also building

- **[OpenForge](https://github.com/Asmodeus14/OpenForge)** — decentralized collaboration platform; Solidity ownership [contracts](https://github.com/Asmodeus14/OpenForge-Contracts), a [chat backend](https://github.com/Asmodeus14/OpenForge-Backend), and a TypeScript client
- **[HealthGuard AI](https://github.com/Asmodeus14/HealthGuard-AI-Disease-Prediction-System)** — scikit-learn ensembles predicting diabetes, heart disease, and Parkinson's from clinical features
- **[JarNox](https://github.com/Asmodeus14/JarNox-Frontend-)** — Next.js stock dashboard
- **[DSA Journey](https://github.com/Asmodeus14/DSA-Solutions-Journey)** — algorithm solutions in Java

---

## Engineering interests

Kernel and driver development · type systems that make invalid states unrepresentable · compiling for exotic targets · the Rust/C boundary in freestanding environments · what an OS should look like when the hardware underneath it stops being purely classical

## Stack

- **Systems** — Rust, C, x86_64 assembly, QEMU, ACPI, NVMe/PCI, linker scripts, `no_std`
- **Compilers** — lexer and parser design, affine type checking, OpenQASM 2.0
- **AI & data** — Python, scikit-learn, pandas, NumPy, Streamlit, Gemini API
- **Web & contracts** — TypeScript, React, Next.js, Flask, Node.js, Solidity
- **Tooling** — Git, Docker, GitHub Actions, dev containers, CMake, Make

---

[Portfolio](https://portfolio-psi-nine-95.vercel.app) · [LinkedIn](https://www.linkedin.com/in/abhay-singh-323b21279/) · [Email](mailto:singhabhay3145@gmail.com)
