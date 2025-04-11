/**
 * @Author: dkzuqxih
 * @Date: April 11th, 2025
 * @Description: This file named 'proxy.pac' is used for WPAD, it works with Clash Verge.
 * 'proxy.pac'does domains rule, Clash does route rule, it's works well.
 * 'proxy.pac' is not newest javascript , but compatible.
 * @MIME: application/x-ns-proxy-autoconfig
 * @URL: http://proxy.server.lan/proxy.pac
 */

"use strict";

var internal_subnets = ["192.168.0.0/16"];
var internal_subnets_len = internal_subnets.length;

var internal_prefixs = ["fd00:"];
var internal_prefixs_len = internal_prefixs.length;

var internal_domains = ["lan","local","localhost"];
var internal_domains_len = internal_domains.length;

var unreachable_subnets = ["142.250.0.0/15","216.239.32.0/19"];
var unreachable_subnets_len = unreachable_subnets.length;

var unreachable_IPv6_prefixs = ["2001:4860:"];
var unreachable_IPv6_prefixs_len = unreachable_IPv6_prefixs.length;

var white_domains = ["baidu.com","qq.com","v2ex.com"];
var white_domains_len = white_domains.length;

var alphabet_domains = ["google.com","google.com.hk","google.com.sg","withgoogle.com","googleusercontent.com",
"googlesource.com","googlescholar.com","googlemaps.com","googlemail.com","googlecode.com","gmodules.com",
"googlearth.com","gmail.com","g.co","google.net","googlebot.com","googleapps.com","gogle.com","gstatic.com",
"googlecode.com","igoogle.com","gooogle.com","gogole.com","gstatic.cn","googlenestcommunity.com","googel.com",
"googleapis.cn","googleapis.com",".google","goo.gl","gserviceaccount.com",
"chromebook.com","xn--ngstr-lra8j.com","ytimg.com",".ggpht.com","chromium.org","1e100.net","appspot.com","android.com","localhost.com",
"like.com","blogger.com","blogspot.com","chrome.com","crashlytics.com","app-measurement.com","xn--ngstr-cn-8za9o.com",
"youtube.com",".youtube-nocookie.com","youtu.be","yt.be","youtubegaming.com","youtubeeducation.com",
".gvt0.com",".gvt1.com",".gvt2.com",".gvt3.com",".gvt0-cn.com",".gvt1-cn.com",".gvt2-cn.com",".gvt3-cn.com"];
var alphabet_domains_len = alphabet_domains.length;

var tiktok_domains = ["tiktok.com",".tiktokcdn-us.com",".tiktokcdn.com",".tiktokv.com"];
var tiktok_domains_len = tiktok_domains.length;

var bing_domains = ["bing.com","bing.net","copilot.microsoft.com","onedrive.live.com"];
var bing_domains_len = bing_domains.length;

var wiki_domains = ["wikipedia.org","wiktionary.org","wikibooks.org"];
var wiki_domains_len = wiki_domains.length;

var github_domains = ["github.com","github.io"];
var github_domains_len = github_domains.length;

var rule = "PROXY proxy:7899; DIRECT";

function FindProxyForURL(url, host)
{
   // 匹配内部域名
   if(isPlainHostName(host))
   {
        return "DIRECT";
   }
   for (var i = 0; i < internal_domains_len; i++)
   {
        if (dnsDomainIs(host, internal_domains[i]))
        {
            return "DIRECT";
        }
   }

  // 判断是否为本地网络地址 (可以使用 isInNet 或 shExpMatch)
  if (isInNet(host, "10.0.0.0", "255.0.0.0") || isInNet(host, "172.16.0.0", "255.240.0.0") || 
  isInNet(host, "192.168.0.0", "255.255.0.0") || isInNet(host, "127.0.0.0", "255.0.0.0"))
  {
    return "DIRECT";
  }

   for( var i = 0; i < alphabet_domains_len; i++ )
   {
       if(dnsDomainIs(host, alphabet_domains[i]))
       {
           return rule;
       }
   }

   for( var i = 0 ; i < tiktok_domains_len ; i++ )
   {
       if(dnsDomainIs(host, tiktok_domains[i]))
       {
           return rule;
       }
   }

   for(  var i= 0 ; i < wiki_domains_len ; i++ )
   {
       if(dnsDomainIs(host, wiki_domains[i]))
       {
           return rule;
       }
   }

//  异常行为：取消注释，www.v2ex.com 无法访问
//  如果是www.v2ex.com.可以访问
//  if(dnsDomainIs(host, "x.com"))
//  {
//    return rule;
//  }

  if(dnsDomainIs(host, "duckduckgo.com"))
  {
    return rule;
  }
  if(dnsDomainIs(host, "imgur.com"))
  {
    return rule;
  }
  if(dnsDomainIs(host, "gravatar.com"))
  {
    return rule;
  }

   for( var i = 0 ; i < bing_domains_len ; i++ )
   {
       if(dnsDomainIs(host, bing_domains[i]))
       {
           return rule;
       }
   }
   
   for( var i = 0; i < github_domains_len; i++)
   {
       if(dnsDomainIs(host, github_domains[i]))
       {
           return rule;
       }
   }
   return proxyForIP(host);
// google的IP地址可参见于 https://www.gstatic.com/ipranges/cloud.json和
// https://www.gstatic.com/ipranges/goog.json
// google的域名可参见于 https://support.google.com/chrome/a/answer/6334001
}

//通过代理访问不可达的IP
function proxyForIP(host)
{
    // 尝试将主机名解析为 IP 地址
    var ipAddress = dnsResolve(host);
    
    // 如果主机名无法解析为 IP 地址，则尝试直接连接
    if (ipAddress === null || ipAddress === undefined || ipAddress === "")
    {
        return "DIRECT";
    }

    // 检查目标 IP 地址是否为 IPv6 地址
    if (ipAddress.indexOf(":") !== -1)
    {
        // 如果是 IPv6 地址，则检查其是否以任何无法直接访问的前缀开头
        for (var i = 0; i < unreachable_IPv6_prefixs_len; i++)
        {
            if (ipAddress.startsWith(unreachable_IPv6_prefixs[i]))
            {
                return rule; // 如果 IPv6 地址以指定的无法访问前缀开头，则使用代理
            }
        }
    }
    // 检查目标 IP 地址是否为 IPv4 地址
    if( ipAddress.indexOf(".") !== -1 )
    {
        // 检查目标 IP 地址是否属于无法直接访问的子网
        for (var i = 0; i < unreachable_subnets_len; i++)
        {
            var subnetParts = unreachable_subnets[i].split('/');
            if (subnetParts.length === 2)
            {
                var network = subnetParts[0];
                var maskLength = parseInt(subnetParts[1]);
                var mask = ipMask(maskLength);
                if (isInNet(ipAddress, network, mask))
                {
                    return rule; // 如果目标 IP 属于无法访问的子网，则使用代理
                }
            }
        }
    }
    //不在无法访问的IP中，则直接连接
    return "DIRECT";
}

/**
 * 判断主机名是否不包含域名部分 (即不包含 ".")
 * @param {string} host - 要检查的主机名
 * @returns {boolean}
 */
function isPlainHostName(host)
{
  return (host.indexOf(".") < 0);
}

/**
 * 根据 CIDR 前缀长度生成 IP 地址掩码
 * @param {number} prefixLength - CIDR 前缀长度 (例如: 8, 16, 24)
 * @returns {string} - IP 地址掩码 (例如: "255.0.0.0")
 */
function ipMask(prefixLength)
{
  if (prefixLength < 0 || prefixLength > 32)
  {
    return "255.255.255.255"; // 默认全 1
  }
  var mask = [];
  for (var i = 0; i < 4; i++)
  {
    var octet = 0;
    if (prefixLength >= 8)
    {
      octet = 255;
      prefixLength -= 8;
    }
    else if (prefixLength > 0) 
    {
      octet = 255 << (8 - prefixLength);
      prefixLength = 0;
    }
    mask.push(octet);
  }
  return mask.join(".");
}

/**
 * 使用 shell 表达式匹配主机名
 * @param {string} str - 要匹配的字符串 (主机名)
 * @param {string} shexp - shell 表达式 (可以使用通配符 *)
 * @returns {boolean}
 */
function shExpMatch(str, shexp)
{
  var re = new RegExp("^" + shexp.split("*").join(".*") + "$");
  return re.test(str);
}

/**
 * 判断主机名或 IP 地址是否位于指定的 IPv4 网络中。
 * 如果传入主机名，会先尝试解析为 IPv4 地址。
 * @param {string} hostOrIp - 要检查的主机名或 IPv4 地址字符串。
 * @param {string} network - IPv4 网络地址 (e.g., "192.168.1.0")。
 * @param {string} mask - IPv4 网络掩码 (e.g., "255.255.255.0")。
 * @returns {boolean} - 如果 IP 在指定网络内则返回 true，否则返回 false。
 */
function isInNet(hostOrIp, network, mask) 
{
    // 1. 尝试解析传入的主机名或 IP 地址
    // dnsResolve 会尝试解析域名；如果传入的是 IP，通常会直接返回该 IP。
    var resolvedIp = dnsResolve(hostOrIp);

    // 2. 检查解析结果
    if (resolvedIp === null || resolvedIp === "" || typeof resolvedIp !== 'string') 
    {
        // 解析失败或返回非字符串，无法判断，返回 false
        // 可以取消下面这行的注释进行调试:
        // alert("isInNet: dnsResolve failed for " + hostOrIp);
        return false;
    }

    // 3. 检查解析结果是否为 IPv4 格式
    // 确保它看起来像 IPv4（包含点号，不包含冒号）
    // 注意: dnsResolve 在某些情况下可能返回 IPv6 地址
    if (resolvedIp.indexOf('.') === -1 || resolvedIp.indexOf(':') !== -1) 
    {
        // 解析结果不是有效的 IPv4 地址字符串，返回 false
        // 可以取消下面这行的注释进行调试:
        // alert("isInNet: Resolved IP " + resolvedIp + " is not IPv4 for " + hostOrIp);
        return false;
    }

    // 4. 执行原始的 IPv4 地址与网络/掩码的比较逻辑
    // 使用 try...catch 来捕获潜在的解析或计算错误
    try 
    {
        // 将点分十进制的 IP 地址、网络地址、掩码转换为 32 位整数进行比较
        var ipaddr_num = ipStringToInt(resolvedIp);
        var network_num = ipStringToInt(network);
        var mask_num = ipStringToInt(mask);

        if (ipaddr_num === null || network_num === null || mask_num === null) 
        {
            // 如果任何一个转换失败，则无法比较
             // alert("isInNet: Failed to convert IP/Net/Mask to integer.");
            return false;
        }

        // 执行按位与操作进行比较
        return ((ipaddr_num & mask_num) === (network_num & mask_num));

    } 
    catch (e) 
    {
        // 捕获任何意外错误
        // alert("isInNet: Error comparing IPs: " + e);
        return false;
    }
}

/**
 * 辅助函数：将点分十进制 IPv4 字符串转换为 32 位整数。
 * @param {string} ipString - IPv4 地址字符串。
 * @returns {number|null} - 32 位整数表示，如果格式无效则返回 null。
 */
function ipStringToInt(ipString) 
{
    var parts = ipString.split('.');
    if (parts.length !== 4) 
    {
        return null; // 格式无效
    }
    var num = 0;
    for (var i = 0; i < 4; i++) 
    {
        var part = parseInt(parts[i], 10);
        // 检查每个部分是否是有效的 0-255 之间的数字
        if (isNaN(part) || part < 0 || part > 255) 
        {
            return null; // 部分无效
        }
        // 左移 8 位并累加 (注意 JavaScript 位运算是 32 位的)
        // 使用 Math.pow 避免大数值溢出问题 (虽然 << 通常也可以，但更显式)
        // 或者直接用位移，因为结果会在 32 位内:
         num = (num << 8) | part;
         // 对于非常大的数字 (技术上不适用于 IPv4)，更安全的方式：
         // num += part * Math.pow(256, 3 - i);
    }
    // 返回无符号右移 0 位的结果，确保结果是 32 位无符号整数形式
    // （尽管在比较中可能不是严格必需，但保持一致性）
    return num >>> 0;
}
