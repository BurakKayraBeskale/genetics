# Anatomy asset attribution

`anatomy.glb` is adapted from **3D Reference Organ Set for United, Female, v1.5**,
by **Kristen Browne and Heidi Schlehlein**, Human Reference Atlas / HuBMAP (2023).
The reference assembly uses Visible Human Dataset anatomy from the U.S. National
Library of Medicine. This is a selected reference assembly, not a complete atlas
or a single-person clinical scan.

- DOI: https://doi.org/10.48539/HBM352.BTSQ.586
- Official dataset: https://purl.humanatlas.io/ref-organ/united-female/v1.5
- Official original GLB: https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb
- License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**
- License legal code: https://creativecommons.org/licenses/by/4.0/legalcode
- License verified against the DOI publisher's DataCite metadata:
  https://api.datacite.org/dois/10.48539/HBM352.BTSQ.586

Adaptations: selected relevant organ structures; excluded reproductive anatomy,
eye detail, lymph nodes and internal brain nuclei; baked original world transforms;
combined compatible surfaces into 27 selectable semantic structures; removed
unused UVs and original materials; welded geometry and simplified with meshoptimizer
(target ratio 0.16, relative error bound 0.005); retained source structure names in
node extras. Application display colors/transparency are separately applied at runtime.

File coordinates remain native meters, Y-up, front toward +Z. The application
normalizes scale and placement. Original GLB was 211,624,968 bytes; delivered file
is 5,733,584 bytes with 286,429 triangles. No Draco/meshopt runtime decoder required.

Source coverage is partial: actual whole-body surface, brain, lungs/bronchi,
intestines/colon/duodenum, liver, pancreas, kidneys/ureters, heart/vessels and partial
skeleton. Stomach, thyroid/adrenal and limb muscles are not present in this HRA
selection. Supplemental assets carry their own license and attribution.

Rebuild: install @gltf-transform/core, @gltf-transform/functions and meshoptimizer
in an external temporary tools directory; download the original GLB outside the
source tree; run `node scripts/anatomy/prepare-anatomy.cjs <tools-dir> <raw-glb>`.
The script writes anatomy.glb and lib/anatomyAssetManifest.json.