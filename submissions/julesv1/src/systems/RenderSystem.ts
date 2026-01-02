import { System } from './System';
import { TransformComponent } from '../components/TransformComponent';
import { MeshComponent } from '../components/MeshComponent';
import { StandardMaterial, Color3, TransformNode, Mesh } from 'babylonjs';
import { LifecycleState } from '../core/Constants';

export class RenderSystem extends System {
    public update(dt: number): void {
        this.level.entities.forEach(entity => {
            // Lifecycle Check: Only update ACTIVE entities
            if (entity.state !== LifecycleState.ACTIVE) return;

            const transform = entity.getComponent<TransformComponent>('Transform');
            const meshComp = entity.getComponent<MeshComponent>('Mesh');

            // We need a way to link the Babylon nodes if hierarchy is used.
            // If only Transform exists, we might need a TransformNode.
            // If Mesh exists, it acts as the node.

            let node: TransformNode | null = null;
            if (meshComp && meshComp.mesh) {
                node = meshComp.mesh;
            }
            // In a full implementation, we'd create a TransformNode if no mesh exists but Transform does.
            // For now, we focus on MeshComponent entities.

            if (transform && node) {
                // Handle Parenting
                if (transform.parentId) {
                    const parentEntity = this.level.entities.get(transform.parentId);
                    if (parentEntity) {
                        const parentMeshComp = parentEntity.getComponent<MeshComponent>('Mesh');
                        // Simplification: Parent must have a mesh for now.
                        if (parentMeshComp && parentMeshComp.mesh && node.parent !== parentMeshComp.mesh) {
                            node.parent = parentMeshComp.mesh;
                        }
                    }
                } else if (node.parent) {
                    node.parent = null; // Detach if no parent
                }

                // Sync Transform -> Mesh
                // If parented, position/rotation are local. Babylon handles this automatically
                // if we set .position/.rotation on the node.
                node.position.copyFrom(transform.position);
                node.rotationQuaternion = transform.rotation;
                node.scaling.copyFrom(transform.scale);

                // Apply color & alpha (Only for meshes)
                if (node instanceof Mesh) {
                    if (!node.material) {
                        const mat = new StandardMaterial("mat_" + entity.id, this.level.scene);
                        node.material = mat;
                    }
                    const mat = node.material as StandardMaterial;
                    if (mat && meshComp) {
                        mat.diffuseColor = Color3.FromHexString(meshComp.color);
                        mat.alpha = meshComp.alpha;
                    }
                }
            }
        });
    }
}
