# C105 PyPI caption QA blueprint

Wrap the dependency-free caption QA contract in a small Python package only
after the local fixture passes. Keep media and credentials out of the package;
the metered transcription call remains an explicit product action.

## Gate

Build and inspect the wheel, verify the package owner and license, and use the
corporate PyPI account/token only after approval. A PyPI upload or download is
not a payment or a reconciled buyer.

Reference: <https://packaging.python.org/en/latest/tutorials/packaging-projects/>.
