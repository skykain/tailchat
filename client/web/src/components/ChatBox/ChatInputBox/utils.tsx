import { closeModal, openModal } from '@/components/Modal';
import { ImageUploadPreviewer } from '@/components/modals/ImageUploadPreviewer';
import { compressImage, fileToDataUrl } from '@/utils/file-helper';
import { canImageCompression } from '@/utils/image-helper';
import React from 'react';
import { uploadFile } from 'tailchat-shared';

/**
 * 上传聊天图片，并返回图片地址
 */
export function uploadMessageImage(image: File): Promise<{
  url: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve) => {
    fileToDataUrl(image).then((imageLocalUrl) => {
      const key = openModal(
        <ImageUploadPreviewer
          imageUrl={imageLocalUrl}
          forceUploadOriginImage={
            canImageCompression(image.type) ? undefined : true
          }
          onCancel={() => {
            closeModal(key);
          }}
          onConfirm={async (info) => {
            let uploadImage = image;
            const uploadOriginImage = info.uploadOriginImage;
            if (uploadOriginImage === false) {
              // 不上传原图
              const originImageSize = image.size;
              uploadImage = await compressImage(image);
              const compressedImageSize = uploadImage.size;

              console.log(
                `压缩结果: ${
                  (compressedImageSize / originImageSize) * 100
                }%(${originImageSize} -> ${compressedImageSize})`
              );
            }
            const fileInfo = await uploadFile(uploadImage, {
              usage: 'chat',
            });
            const imageRemoteUrl = fileInfo.url;

            resolve({
              url: imageRemoteUrl,
              width: info.size.width,
              height: info.size.height,
            });
            closeModal(key);
          }}
        />
      );
    });
  });
}

/**
 * 上传文件，并返回地址
 */
export async function uploadMessageFile(file: File): Promise<{
  name: string;
  url: string;
}> {
  const fileInfo = await uploadFile(file, {
    usage: 'chat',
  });

  return {
    name: file.name || fileInfo.etag,
    url: fileInfo.url,
  };
}
