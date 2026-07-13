"""Connector contracts for production data refresh.

The release build uses archived official source snapshots and reproducible
transformations. Automated sources are refreshed through the production data
builder; QS Engineering & Technology uses a checksum-verified official-file
import because no stable public API is available for the required country
aggregation.
"""
