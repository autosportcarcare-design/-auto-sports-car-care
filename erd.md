# Phase 1 relational model
```mermaid
erDiagram
 User ||--o{ Session : authenticates
 User ||--|| Customer : owns
 Customer ||--o{ CustomerAddress : stores
 Customer ||--o{ Cart : owns
 Customer ||--o{ Order : places
 Department ||--o{ Category : contains
 Brand ||--o{ Product : brands
 Category ||--o{ Product : groups
 Product ||--o{ ProductVariant : offers
 ProductVariant ||--o{ CartItem : selected
 Cart ||--o{ CartItem : contains
 Order ||--o{ OrderItem : snapshots
 Order ||--o{ Payment : records
 Order ||--o{ OrderEvent : tracks
 SavedList ||--o{ SavedListItem : contains
 Customer ||--o{ SavedList : saves
```
InventoryReservation and InventoryMovement reference immutable variant/order IDs. SQL migrations add foreign keys and nonnegative stock/quantity constraints in addition to Prisma relationships. Price and VAT use Decimal; each order line stores its tax rate and totals.
