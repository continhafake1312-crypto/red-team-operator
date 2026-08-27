import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import javax.management.openmbean.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxWzaDump {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  static MBeanServerConnection m;
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>();
    env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect();
    m=conn.getMBeanServerConnection();
    // List all top-level Wowza MBeans (single-key, server-ish)
    Set<ObjectName> all = m.queryNames(new ObjectName("WowzaStreamingEngine:*"), null);
    System.out.println("=== All Wowza MBean keys (unique key patterns) ===");
    Map<String,Integer> patterns=new TreeMap<>();
    for (ObjectName on: all) {
      // build a pattern with only top keys (vHosts/applications level)
      StringBuilder sb=new StringBuilder();
      java.util.Hashtable<String,String> kl=on.getKeyPropertyList(); String[] ks=kl.keySet().toArray(new String[0]);
      Arrays.sort(ks);
      for (String k:ks){ sb.append(k).append("=").append(on.getKeyProperty(k)).append(","); }
      patterns.merge(sb.toString(),1,Integer::sum);
    }
    patterns.forEach((k,v)->{ if(v<=3) System.out.println("  ("+v+") "+k); });
    // Top-level server MBeans (no vHosts): look for Server, Connections, IO
    System.out.println("\n=== Server-level (no vHosts) Wowza MBeans ===");
    Set<ObjectName> srv = m.queryNames(new ObjectName("WowzaStreamingEngine:*"), null);
    for (ObjectName on:srv){
      if (on.getKeyProperty("vHosts")==null) {
        System.out.println("  "+on);
      }
    }
    // dump attributes for first few server-level MBeans
    System.out.println("\n=== Attribute dump (server-level, first 20) ===");
    int n=0;
    for (ObjectName on:srv){
      if (on.getKeyProperty("vHosts")!=null) continue;
      n++; if(n>20) break;
      System.out.println("--- "+on+" ---");
      try {
        MBeanInfo info=m.getMBeanInfo(on);
        for (MBeanAttributeInfo at:info.getAttributes()){
          if(!at.isReadable()) continue;
          try {
            Object v=m.getAttribute(on,at.getName());
            String s=(v==null)?"null":v.toString();
            if(s.length()>500) s=s.substring(0,500)+"...";
            System.out.println("    "+at.getName()+" = "+s);
          } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+"]"); }
        }
      } catch(Exception e){ System.out.println("  info err: "+e.getMessage()); }
    }
    conn.close();
  }
}
