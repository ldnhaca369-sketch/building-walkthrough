import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Tải file GLB và metadata JSON song song.
 * Trả về { gltf, meta }.
 */
export async function loadBuilding(glbUrl, metaUrl) {
  const gltfLoader = new GLTFLoader();

  const [gltf, meta] = await Promise.all([
    gltfLoader.loadAsync(glbUrl),
    fetch(metaUrl).then((r) => {
      if (!r.ok) throw new Error(`Không tải được metadata: ${r.status}`);
      return r.json();
    }),
  ]);

  return { gltf, meta };
}
