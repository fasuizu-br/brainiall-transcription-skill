# Docker Hub worker

Build a minimal, pinned worker image for authorized media. Keep keys out of
image layers and logs; the image should call the owned API only after a user
has configured a key. Tag and pull analytics are discovery signals, not payer
identity. Publish only with the corporate Docker account and current license
and privacy review.

Reference: [Docker Hub repositories](https://docs.docker.com/docker-hub/repos/).
Measure `pull -> first value -> metered call -> Stripe -> payout`; stop if the
route cannot preserve buyer-level attribution.
