#!/bin/bash
echo "Syncing production data to dev..."
PGPASSWORD="8TrmlELB2Sdo7cFG1v-l3i27KJpHaZZv42UuRtYufK8" pg_dump -h localhost -U telaviva_admin telaviva | PGPASSWORD="8TrmlELB2Sdo7cFG1v-l3i27KJpHaZZv42UuRtYufK8" psql -h localhost -U telaviva_admin telaviva_dev
echo "Done! Dev DB updated."
