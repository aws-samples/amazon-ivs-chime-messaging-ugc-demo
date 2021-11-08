#!/usr/bin/env bash

set -eux

sudo apt-get -y install jq curl
INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data//instance-id)
VOLUME_ID=$(aws ec2 describe-instances --instance-id $INSTANCE_ID | jq -r .Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId)

NEW_SIZE=20
aws ec2 modify-volume --volume-id "$VOLUME_ID" --size $NEW_SIZE

while [ "$(aws ec2 describe-volumes-modifications --volume-id "$VOLUME_ID" --filters Name=modification-state,Values="optimizing","completed" | jq '.VolumesModifications | length')" != "1" ]; do
  sleep 1
done

sudo shutdown -r now
