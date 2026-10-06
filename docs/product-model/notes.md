# Product Model Notes

Phase 1 persists catalogue facts only. Technical knowledge, compatibility, mixing instructions, documents and product relationships remain later-phase domains.

`ProductVariant.price` uses PostgreSQL Decimal. Financial calculations use decimal arithmetic, never JavaScript floating point.
