# CFI staking quote recovery — 2026-11-18

Production's single API process was running out of SQLAlchemy pool connections
during concurrent Season activity. Its quote and configuration requests timed
out or returned 500/503. The original Season scorer calculated qualified
referrals with a quadratic scan of more than 4,400 profiles and held its DB
connection during that calculation. Some async paths also waited for synchronous
DB work on the event loop.

The fix calculates referral counts in one pass, releases the DB connection before
scoring, and shares in-flight score calculations. A committed change to scoring
data invalidates in-flight results so subsequent reads do not reuse a stale
snapshot. Staking quote/authentication, verification and background index DB
work no longer block the event loop; RPC URL lookup no longer needs the DB.

Production API image: `custos-api:staking-fix-20261118-72b7407`
(`sha256:a7ef9cf0cbfcd0df897d1c7168bbd1a4904c4ba8a9b620cc22d8c3d165a5f553`).
It was built from the then-running API image with the new `reality.py` copied
over it. This preserves functionality in the running image because other files
under `/opt/custos/apps/api` may be older than the deployed image. The updated
`reality.py` was also placed in that source directory; do not assume the rest of
that directory is a complete current release when rebuilding.

Rollback image: `custos-api:before-staking-fix-20261118`. Both the previously
running source and the previously stored source are preserved in
`/opt/custos/rollback-staking-20261118-72b7407`. To roll back the API, restore
the running source, retag the rollback image as `deploy-api:latest`, and use the
Compose command below. Do not delete or reset the data volume.

```bash
cd /opt/custos
sudo cp rollback-staking-20261118-72b7407/reality.running-before.py apps/api/reality.py
sudo docker image tag custos-api:before-staking-fix-20261118 deploy-api:latest
sudo docker compose --env-file /opt/custos/.env --env-file /opt/custos/deploy/reality.vm.env \
  -f /opt/custos/deploy/compose.vm.yaml up -d --no-deps --no-build --wait api
```

Verification: 38 Reality tests passed on the release image. A production DB
read-only snapshot produced identical scores and ranks for all 4,413 accounts;
the scorer ran in 0.277 seconds versus 11.384 seconds under the same restricted
CPU test. A local isolated test with 200 simultaneous registrations and 200
signed-quote requests succeeded; its price and RPC dependencies were mocked.
After rollout, the public anonymous quote returned 200, and an authenticated
production quote's signature and a read-only GIWA contract stake simulation
passed. The temporary login was logged out. Desktop and mobile Chrome pages
displayed live CFI estimates. No onchain transaction was sent.
