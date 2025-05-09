﻿using System.ComponentModel;
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

        public static T JsonToObject<T>(this string s)
            => System.Text.Json.JsonSerializer.Deserialize<T>(s);

        public static string EnumToString<T>(this T enumValue) where T : Enum
        {
            var t = enumValue.ToString();
            return enumValue.ToString().Replace("_"," ");
        }
        public static string Stamp(this Guid id)
        {
            return id.ToString().Replace("-", "");
        }

    }
}
