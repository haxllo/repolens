# ADR 004: Secure Code Execution Sandbox

## Context
To match the capabilities of "CodeWiki," RepoLens must evolve from static AST analysis to dynamic code execution. This allows users to:
1. Verify AI-generated explanations.
2. Run unit tests on analyzed functions live in the browser.
3. Generate "Live Documentation" where code blocks are executable.

## Decision
We will implement a **Docker-based Sandbox** within the `apps/worker` service.

### 1. Technology Stack
- **Docker SDK for Python**: To manage containers programmatically.
- **gVisor (Optional)**: For an extra layer of container isolation if running untrusted code.
- **Redis**: To manage execution job queues and stream stdout/stderr back to the UI.

### 2. Security Constraints (Per Snippets)
- **Network**: Disabled (`network_mode='none'`) to prevent data exfiltration.
- **Memory**: Hard limit (e.g., 512MB).
- **Time**: Execution timeout (e.g., 10s).
- **Filesystem**: Read-only root, with a temporary writable `/workspace`.

### 3. API Contract (Worker)

```python
def execute_code(code: str, language: str, context_files: dict = None):
    """
    Spins up a container, writes code + context to disk, runs it, 
    and returns stdout/stderr/exit_code.
    """
    pass
```

### 4. Integration
- **Frontend**: The `ReactMD` component will detect ````python` blocks and render a "Run" button.
- **Backend**: Emits a `EXECUTE_JOB` event to Redis.
- **Worker**: Picks up the job, executes in Docker, returns result.

## Consequences
- **Positive**: Massive feature jump; enables "Live Docs".
- **Negative**: High resource usage (RAM/CPU) for running containers. Security risk if not sandboxed correctly.
