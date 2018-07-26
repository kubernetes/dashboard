| Dashboard \ Kubernetes | 1.4 | 1.5 | 1.6 | 1.7 | 1.8 | 1.9 |
|------------------------|-----|-----|-----|-----|-----|-----|
| **1.4**                | ✓   | ✕   | ✕   | ✕   | ✕   | x   |
| **1.5**                | ✕   | ✓   | ✕   | ✕   | ✕   | x   |
| **1.6**                | ✕   | ✕   | ✓   | ?   | ✕   | x   |
| **1.7**                | ✕   | ✕   | ?   | ✓   | ?   | ?   |
| **1.8**                | ✕   | ✕   | ✕   | ✕   | ✓   | ✓   |
| **HEAD**               | ✕   | ✕   | ✕   | ✕   | ✓   | ✓   |

- `✓` Fully supported version range.
- `?` Due to breaking changes between Kubernetes API versions, some features might not work in Dashboard (logs, search
etc.).
- `✕` Unsupported version range.