class ImageUtils {
  /**
   * Base64 이미지 검증
   * @param {string} base64Image - Base64 인코딩된 이미지 문자열
   * @returns {Object} 검증 결과 { isValid, error, imageInfo }
   */
  validateBase64Image(base64Image) {
    try {
      // Base64 형식 확인
      const base64Regex = /^data:image\/(jpeg|jpg|png);base64,(.+)$/;
      const matches = base64Image.match(base64Regex);
      
      if (!matches) {
        return {
          isValid: false,
          error: 'Invalid image format. Only JPEG and PNG are allowed.'
        };
      }

      const imageType = matches[1];
      const imageData = matches[2];

      // Base64 데이터 크기 계산 (대략적)
      const sizeInBytes = (imageData.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      // 1MB 크기 제한
      if (sizeInMB > 1) {
        return {
          isValid: false,
          error: 'Image size exceeds 1MB limit.'
        };
      }

      // 이미지 차원 검증을 위해 Buffer로 변환
      const imageBuffer = Buffer.from(imageData, 'base64');
      const dimensions = this.getImageDimensions(imageBuffer, imageType);

      if (!dimensions) {
        return {
          isValid: false,
          error: 'Unable to read image dimensions.'
        };
      }

      // 정사각형이고 500x500 ~ 1000x1000 범위 확인
      if (dimensions.width !== dimensions.height) {
        return {
          isValid: false,
          error: 'Image must be square (width equals height).'
        };
      }

      if (dimensions.width < 500 || dimensions.width > 1000) {
        return {
          isValid: false,
          error: 'Image dimensions must be between 500x500 and 1000x1000 pixels.'
        };
      }

      return {
        isValid: true,
        imageInfo: {
          type: imageType,
          size: sizeInBytes,
          dimensions: dimensions
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate image: ' + error.message
      };
    }
  }

  /**
   * 이미지 차원 정보 추출 (간단한 구현)
   * @param {Buffer} buffer - 이미지 버퍼
   * @param {string} type - 이미지 타입 (jpeg, png)
   * @returns {Object|null} { width, height }
   */
  getImageDimensions(buffer, type) {
    try {
      if (type === 'png') {
        return this.getPngDimensions(buffer);
      } else if (type === 'jpeg' || type === 'jpg') {
        return this.getJpegDimensions(buffer);
      }
      return null;
    } catch (error) {
      console.error('Error reading image dimensions:', error);
      return null;
    }
  }

  /**
   * PNG 이미지 차원 추출
   */
  getPngDimensions(buffer) {
    // PNG 헤더 확인
    if (buffer.length < 24) return null;
    
    // PNG 시그니처 확인
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    if (!buffer.subarray(0, 8).equals(pngSignature)) return null;

    // IHDR 청크에서 width, height 읽기 (빅엔디안)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return { width, height };
  }

  /**
   * JPEG 이미지 차원 추출
   */
  getJpegDimensions(buffer) {
    // JPEG 시그니처 확인
    if (buffer.length < 4) return null;
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return null;

    let offset = 2;
    
    // JPEG 세그먼트를 순회하며 SOF 마커 찾기
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xFF) break;
      
      const marker = buffer[offset + 1];
      offset += 2;

      // SOF0, SOF1, SOF2 마커 확인
      if (marker >= 0xC0 && marker <= 0xC2) {
        if (offset + 5 < buffer.length) {
          const height = buffer.readUInt16BE(offset + 1);
          const width = buffer.readUInt16BE(offset + 3);
          return { width, height };
        }
        break;
      }

      // 다음 세그먼트로 건너뛰기
      if (offset >= buffer.length - 2) break;
      const segmentLength = buffer.readUInt16BE(offset);
      offset += segmentLength;
    }

    return null;
  }

  /**
   * 기본 이미지 URL 생성
   * @param {string} role - 사용자 역할 (mentor 또는 mentee)
   * @returns {string} 기본 이미지 URL
   */
  getDefaultImageUrl(role) {
    const roleText = role.toUpperCase();
    return `https://placehold.co/500x500.jpg?text=${roleText}`;
  }

  /**
   * 이미지 URL 생성
   * @param {Object} user - 사용자 객체
   * @returns {string} 이미지 URL
   */
  getImageUrl(user) {
    if (user.image_data) {
      return `/images/${user.role}/${user.id}`;
    }
    return this.getDefaultImageUrl(user.role);
  }
}

module.exports = new ImageUtils();
