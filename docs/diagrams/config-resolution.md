# Configuration Resolution Diagram

```mermaid
flowchart TD
    A[Business Rule / Script Include / Portal API call] --> B[TrainingConfigService.getValue key]
    B --> C{GlideSessionCache has key?}
    C -->|Yes| D[Return cached value]
    C -->|No| E[Read sys_property x_783010_tocc_a1.config.key]
    E --> F{Property non-empty?}
    F -->|Yes| G[Use property override]
    F -->|No| H[Query x_783010_tocc_a1_training_config active=true by name]
    H --> I{Record found with non-empty value?}
    I -->|Yes| J[Use table value]
    I -->|No| K[Use method default]
    G --> L[Cache and return]
    J --> L
    K --> L
```

## Notes

- Runtime precedence is `sys_properties` override first, table fallback second.
- Empty property value intentionally means "fallback to table/default".
- Session cache avoids repeated database hits in the same transaction context.

