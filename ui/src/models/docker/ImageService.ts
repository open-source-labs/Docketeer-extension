import { ddClientRequest, encodeQuery } from "../ddClientRequest";
import { ImageType, ContainerPS } from "../../../../types";
export const ImageService = {
  async getImages(): Promise<ImageType[]> {
    const images = await ddClientRequest<ImageType[]>('/api/docker/image');
    return images;
  },

  async runImage(imageName: string, imageTag: string, containerName: string = imageName): Promise<boolean>{
    try {
      await ddClientRequest('/api/docker/image/run', 'POST', { imageName, tag: imageTag, containerName });
      return true;
    } catch (error) {
      console.error(`Failed to start container from: ${imageName}`);
      return false;
    }
  },

  async removeImage(imageId: string): Promise<boolean>{
    try {
      await ddClientRequest(`/api/docker/image/${imageId}`, 'DELETE')
      return true;
    } catch (error) {
      console.error(`Failed to remove image by ID: ${imageId}`);
      return false;
    }
  },

  async getScan(scanName: string) {
    try {
      const scan = await ddClientRequest('/api/docker/image/scan', 'POST', { scanName: scanName })
      return scan
    } catch (error) {
      console.error(`Failed to Scan the image vulnerability for ${scanName}`);
      return
    }
  } 
}