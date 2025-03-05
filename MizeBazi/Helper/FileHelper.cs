using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace MizeBazi.Helper;

public enum FileExtensions
{
    Unknown,
    dir,
    pdf,
    jpeg,
    jpg,
    png,
    gif,
    bmp,
    tiff,
    mp4,
    cer,
    xls,
    xlsx,
    doc,
    docx,
    zip,
    rar,
    _7z
}

public static class FileHelper
{
    public static void ResizeImageWithAspectRatio(string inputPath, string outputPath, int maxWidth, int maxHeight)
    {
        using (var image = Image.Load(inputPath))
        {
            // محاسبه اندازه جدید با حفظ نسبت ابعاد
            var options = new ResizeOptions
            {
                Size = new Size(maxWidth, maxHeight),
                Mode = ResizeMode.Max
            };

            // تغییر اندازه تصویر
            image.Mutate(x => x.Resize(options));

            // ذخیره تصویر تغییر اندازه داده شده
            image.Save(outputPath);
        }
    }
    public static byte[] ResizeImageWithAspectRatio(byte[] inputImageBytes, int maxWidth, int maxHeight)
    {
        // بارگذاری تصویر از آرایه بایت
        using (var image = Image.Load(inputImageBytes))
        {
            // محاسبه اندازه جدید با حفظ نسبت ابعاد
            var options = new ResizeOptions
            {
                Size = new Size(maxWidth, maxHeight),
                Mode = ResizeMode.Max
            };

            // تغییر اندازه تصویر
            image.Mutate(x => x.Resize(options));

            // ذخیره تصویر تغییر اندازه داده شده به صورت آرایه بایت
            using (var memoryStream = new System.IO.MemoryStream())
            {
                image.Save(memoryStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder());
                return memoryStream.ToArray();
            }
        }
    }

    public static bool Validate(string fileName, string fileContentType, byte[] fileData, FileExtensions validExtensions)
    {
        string fileExtension = Path.GetExtension(fileName);
        fileExtension = fileExtension.ToLower().Replace(".", "");
        FileExtensions result = FileExtensions.Unknown;
        System.Enum.TryParse<FileExtensions>(fileExtension, out result);
        if (result == FileExtensions.Unknown)
        {
            return false;
        }

        if ((validExtensions & result) != result)
        {
            return false;
        }

        if (!ValidateFileMimeType(fileExtension, fileContentType))
        {
            return false;
        }

        if (!ValidateFileSignature(fileExtension, fileData))
        {
            return false;
        }

        return true;
    }

    private static bool ValidateFileMimeType(string fileExtension, string fileMimeType)
    {
        switch (fileExtension)
        {
            case "pdf":
                return fileMimeType == "application/pdf";
            case "jpeg":
            case "jpg":
                return fileMimeType == "image/jpeg" || fileMimeType == "image/x-citrix-jpeg";
            case "png":
                return fileMimeType == "image/png" || fileMimeType == "image/x-citrix-png" || fileMimeType == "image/x-png";
            case "gif":
                return fileMimeType == "image/gif";
            case "bmp":
                return fileMimeType == "image/bmp";
            case "tiff":
                return fileMimeType == "image/tiff";
            case "mp4":
                return fileMimeType == "video/mp4" || fileMimeType == "application/mp4" || fileMimeType == "audio/mp4";
            case "xls":
            case "xlsx":
                {
                    int result2;
                    switch (fileMimeType)
                    {
                        default:
                            result2 = ((fileMimeType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ? 1 : 0);
                            break;
                        case "application/vnd.ms-excel":
                        case "application/msexcel":
                        case "application/x-msexcel":
                        case "application/x-ms-excel":
                        case "application/x-excel":
                        case "application/x-dos_ms_excel":
                        case "application/xls":
                        case "application/x-xls":
                            result2 = 1;
                            break;
                    }

                    return (byte)result2 != 0;
                }
            case "doc":
            case "docx":
                return fileMimeType == "application/msword" || fileMimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "zip":
                {
                    int result;
                    switch (fileMimeType)
                    {
                        default:
                            result = ((fileMimeType == "application/x-rar-compressed") ? 1 : 0);
                            break;
                        case "application/zip":
                        case "application/x-zip-compressed":
                        case "application/x-7z-compressed":
                            result = 1;
                            break;
                    }

                    return (byte)result != 0;
                }
            case "rar":
                return fileMimeType == "application/vnd.rar" || fileMimeType == "application/x-rar-compressed";
            case "7z":
                return fileMimeType == "application/x-7z-compressed";
            case "cer":
                return fileMimeType == "application/x-x509-ca-cert";
            default:
                return false;
        }
    }

    private static bool ValidateFileSignature(string fileExtension, byte[] fileData)
    {
        if (fileData == null)
        {
            return false;
        }

        return GetSignature(fileExtension)?.Any((byte[] signature) => fileData.Take(signature.Length).SequenceEqual(signature)) ?? false;
    }

    private static List<byte[]> GetSignature(string fileExtension)
    {
        switch (fileExtension)
        {
            case "pdf":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 37, 80, 68, 70 });
                    return list;
                }
            case "jpeg":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 255, 216, 255, 224 });
                    list.Add(new byte[4] { 255, 216, 255, 226 });
                    list.Add(new byte[4] { 255, 216, 255, 227 });
                    return list;
                }
            case "jpg":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 255, 216, 255, 224 });
                    list.Add(new byte[4] { 255, 216, 255, 225 });
                    list.Add(new byte[4] { 255, 216, 255, 232 });
                    return list;
                }
            case "gif":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 71, 73, 70, 56 });
                    return list;
                }
            case "png":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[8] { 137, 80, 78, 71, 13, 10, 26, 10 });
                    return list;
                }
            case "bmp":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[2] { 66, 77 });
                    return list;
                }
            case "tiff":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[3] { 73, 32, 73 });
                    list.Add(new byte[4] { 73, 73, 42, 0 });
                    list.Add(new byte[4] { 77, 77, 0, 42 });
                    list.Add(new byte[4] { 77, 77, 0, 43 });
                    return list;
                }
            case "xls":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[8] { 208, 207, 17, 224, 161, 177, 26, 225 });
                    list.Add(new byte[8] { 9, 8, 16, 0, 0, 6, 5, 0 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 16 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 31 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 34 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 35 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 40 });
                    list.Add(new byte[5] { 253, 255, 255, 255, 41 });
                    return list;
                }
            case "xlsx":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 80, 75, 3, 4 });
                    list.Add(new byte[8] { 80, 75, 3, 4, 20, 0, 6, 0 });
                    return list;
                }
            case "doc":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[8] { 208, 207, 17, 224, 161, 177, 26, 225 });
                    list.Add(new byte[4] { 13, 68, 79, 67 });
                    list.Add(new byte[8] { 207, 17, 224, 161, 177, 26, 225, 0 });
                    list.Add(new byte[4] { 219, 165, 45, 0 });
                    list.Add(new byte[4] { 236, 165, 193, 0 });
                    return list;
                }
            case "docx":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 80, 75, 3, 4 });
                    list.Add(new byte[8] { 80, 75, 3, 4, 20, 0, 6, 0 });
                    return list;
                }
            case "zip":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[4] { 80, 75, 3, 4 });
                    list.Add(new byte[6] { 80, 75, 76, 73, 84, 69 });
                    list.Add(new byte[5] { 80, 75, 83, 112, 88 });
                    list.Add(new byte[4] { 80, 75, 5, 6 });
                    list.Add(new byte[4] { 80, 75, 7, 8 });
                    list.Add(new byte[6] { 87, 105, 110, 90, 105, 112 });
                    list.Add(new byte[8] { 80, 75, 3, 4, 20, 0, 1, 0 });
                    return list;
                }
            case "rar":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[7] { 82, 97, 114, 33, 26, 7, 0 });
                    return list;
                }
            case "7z":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[6] { 55, 122, 188, 175, 39, 28 });
                    return list;
                }
            case "mp4":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[8] { 0, 0, 0, 20, 102, 116, 121, 112 });
                    list.Add(new byte[8] { 0, 0, 0, 24, 102, 116, 121, 112 });
                    list.Add(new byte[8] { 0, 0, 0, 32, 102, 116, 121, 112 });
                    list.Add(new byte[8] { 0, 0, 0, 28, 102, 116, 121, 112 });
                    return list;
                }
            case "cer":
                {
                    List<byte[]> list = new List<byte[]>();
                    list.Add(new byte[0]);
                    return list;
                }
            default:
                return null;
        }
    }
}