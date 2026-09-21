#!/usr/bin/env bash
set -euo pipefail

content_root="${CONTENT_ROOT:-/srv/personal-website/content}"
incoming="${content_root}/incoming"
releases="${content_root}/releases"
active="${content_root}/active"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "${incoming}" ]]; then
  echo "Missing incoming content directory: ${incoming}" >&2
  exit 1
fi

node "${script_dir}/validate-content.mjs" "${incoming}"

mkdir -p "${releases}"
release_name="$(date -u +%Y%m%dT%H%M%SZ)"
release_path="${releases}/${release_name}"
old_release=""
if [[ -L "${active}" ]]; then
  old_release="$(readlink -f -- "${active}")"
elif [[ -e "${active}" ]]; then
  echo "${active} must be a symbolic link" >&2
  exit 1
fi

mv -- "${incoming}" "${release_path}"
ln -s -- "releases/${release_name}" "${active}.next"
mv -Tf -- "${active}.next" "${active}"
mkdir -p "${incoming}"

if [[ -n "${old_release}" && "${old_release}" != "${release_path}" && -d "${old_release}" ]]; then
  rm -rf -- "${old_release}"
fi

echo "Published content release ${release_name}. No previous release was retained."

