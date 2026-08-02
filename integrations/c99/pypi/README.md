# C99 — Python CLI packaging recipe

A TestPyPI-first preflight for a Transcreve BR CLI.

## Release checklist

1. Build a wheel and source distribution from pyproject.toml.
2. Test installation in a clean virtual environment using TestPyPI.
3. Inspect README and metadata for private data or unsupported claims.
4. Keep API credentials outside the package and shell history.
5. Promote to PyPI only after an authorized corporate account and a deliberate release decision.

Use c99|pypi|br|cli for the own-site intent. An install proves technical activation, not payment.

Official reference: https://packaging.python.org/en/latest/flow/
