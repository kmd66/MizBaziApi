using System.ComponentModel;
using System.IO.Compression;

namespace MizeBazi.Helper
{
    public static class ExtentionHelper
    {
        public static byte[] GZipCompress(this byte[] data)
        {
            using (var compressedStream = new MemoryStream())
            using (var gzipStream = new GZipStream(compressedStream, CompressionMode.Compress))
            {
                gzipStream.Write(data, 0, data.Length);
                gzipStream.Close();
                return compressedStream.ToArray();
            }
        }
        public static byte[] GZipDecompress(this byte[] data)
        {
            using (var compressedStream = new MemoryStream(data))
            using (var gzipStream = new GZipStream(compressedStream, CompressionMode.Decompress))
            using (var resultStream = new MemoryStream())
            {
                gzipStream.CopyTo(resultStream);
                return resultStream.ToArray();
            }
        }
        public static string ToJson(this object obj)
            => System.Text.Json.JsonSerializer.Serialize(obj);

        public static string EnumToString<T>(this T enumValue) where T : Enum
        {

            return enumValue.ToString().Replace("_"," ");
        }

    }
}
